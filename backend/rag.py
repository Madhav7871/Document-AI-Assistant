"""
rag.py
------
Loads the FAISS index built by ingest.py and exposes:
    - retrieve(query, k)   -> top-k relevant chunks
    - answer(query, history) -> a natural-language answer grounded in the PDF
    - generate_quiz(difficulty, randomizer) -> generates 5 unique questions based on random document chunks
"""

import json
import os
import random # <-- NEW IMPORT ADDED HERE FOR QUIZ VARIETY

import faiss
import google.generativeai as genai
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
INDEX_DIR = os.path.join(os.path.dirname(__file__), "index")
TOP_K = 5

# Fetch the model name from .env, defaulting to gemini-1.5-flash
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

SYSTEM_PROMPT = """You are a friendly, helpful study assistant chatbot.
You answer questions ONLY using the CONTEXT excerpts provided below, which
come from uploaded PDF documents. Follow these rules:

1. Base your answer strictly on the given context. Do not invent facts that
   aren't supported by it.
2. If the context doesn't contain enough information to answer, say so
   politely and suggest what part of the material might help instead.
3. Explain things clearly and simply, like a friendly tutor would -
   use short paragraphs, bullet points, or numbered steps when useful.
4. Keep a warm, encouraging, conversational tone.
"""


class RagEngine:
    def __init__(self):
        index_path = os.path.join(INDEX_DIR, "faiss.index")
        chunks_path = os.path.join(INDEX_DIR, "chunks.json")

        if not os.path.exists(index_path) or not os.path.exists(chunks_path):
            raise FileNotFoundError(
                "Index files not found. Upload a PDF first to generate the index."
            )

        self.index = faiss.read_index(index_path)
        with open(chunks_path, "r", encoding="utf-8") as f:
            self.chunks = json.load(f)

        self.embed_model = SentenceTransformer(EMBED_MODEL_NAME)

        # Retrieve and validate the API key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("API Key is missing! Please make sure GEMINI_API_KEY is set in your .env file.")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT,
        )

    def retrieve(self, query: str, k: int = TOP_K):
        vec = self.embed_model.encode([query], convert_to_numpy=True).astype("float32")
        faiss.normalize_L2(vec)
        scores, idxs = self.index.search(vec, k)

        results = []
        for score, idx in zip(scores[0], idxs[0]):
            if idx == -1:
                continue
            chunk = self.chunks[idx]
            results.append({**chunk, "score": float(score)})
        return results

    def _build_context(self, retrieved):
        parts = []
        for r in retrieved:
            file_info = f" ({r['file']})" if "file" in r else ""
            parts.append(f"[Page {r['page']}{file_info}]\n{r['text']}")
        return "\n\n---\n\n".join(parts)

    def answer(self, query: str, history: list | None = None):
        history = history or []
        retrieved = self.retrieve(query)
        context = self._build_context(retrieved)

        user_message = (
            f"CONTEXT:\n{context}\n\n"
            f"QUESTION: {query}"
        )

        # Gemini's chat history uses role "model" instead of "assistant",
        # and each turn's text goes inside a "parts" list.
        gemini_history = []
        for turn in history[-6:]:
            role = "model" if turn["role"] == "assistant" else "user"
            gemini_history.append({"role": role, "parts": [turn["content"]]})

        chat = self.model.start_chat(history=gemini_history)
        response = chat.send_message(
            user_message,
            generation_config=genai.types.GenerationConfig(max_output_tokens=1000),
        )

        answer_text = response.text

        sources = sorted({r["page"] for r in retrieved})
        return {"answer": answer_text, "sources": sources}

    # =========================================================================
    # NEW METHOD ADDED BELOW FOR QUIZ GENERATION (DOES NOT AFFECT CHATBOT)
    # =========================================================================
    
    def generate_quiz(self, difficulty: str, randomizer: int):
        # 1. Grab 10 random chunks from the document to ensure variety every time
        num_chunks = min(10, len(self.chunks))
        random_chunks = random.sample(self.chunks, num_chunks)
        context = self._build_context(random_chunks)

        # 2. The Strict Prompt
        prompt = f"""
        You are an expert quiz generator. Based on the provided document text, generate exactly 5 multiple-choice questions.

        Requested Difficulty Level: {difficulty}
        Random Seed: {randomizer}

        CRITICAL RULES YOU MUST FOLLOW:
        1. QUANTITY: You MUST generate exactly 5 questions. No more, no less.
        2. VARIETY: Focus on different parts of the text.
        3. DIFFICULTY: 
           - Easy: Basic definitions.
           - Medium: Connecting ideas.
           - Hard: Deep analysis and complex reasoning.
        4. FORMAT: You MUST return a valid JSON array.

        Each object must follow this exact structure:
        [
          {{
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "The exact text of the correct option"
          }}
        ]

        DOCUMENT TEXT:
        {context}
        """

        # 3. Create a temporary model instance just for the quiz (ignores chatbot system prompt)
        quiz_model = genai.GenerativeModel(model_name=GEMINI_MODEL)
        
        # 4. Call Gemini with Temperature 0.7 for creativity and force JSON output
        response = quiz_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                response_mime_type="application/json", # Forces Gemini to output clean JSON
            )
        )

        # 5. Parse and return the JSON directly
        try:
            return json.loads(response.text)
        except Exception as e:
            print("Error parsing JSON:", e)
            return [] # Returns empty array if AI fails