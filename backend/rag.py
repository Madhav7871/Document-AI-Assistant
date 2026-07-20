"""
rag.py
------
Loads the FAISS index built by ingest.py and exposes:
    - retrieve(query, k)   -> top-k relevant chunks
    - answer(query, history) -> a natural-language answer grounded in the PDF
"""

import json
import os

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

# Fetch the model name from .env, defaulting to gemini-2.5-flash
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

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