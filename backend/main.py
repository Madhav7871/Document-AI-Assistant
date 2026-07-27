import json
import os
import shutil
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

load_dotenv()

from ingest import rebuild_index_progress  # noqa: E402
from rag import RagEngine  # noqa: E402

app = FastAPI(title="Document AI Chatbot (Local)")

# Frontend CORS Configuration (Vite React app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine: Optional[RagEngine] = None


def reload_rag_engine():
    global engine
    try:
        engine = RagEngine()
        print("✅ RagEngine successfully reloaded on Local Machine.")
    except Exception as e:
        print(f"⚠️ [engine loading warning] {e}")
        engine = None


@app.on_event("startup")
def load_engine():
    reload_rag_engine()


# Data Models
class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: Optional[str] = None
    question: Optional[str] = None  # Added support for 'question' key from voice frontend
    history: list[ChatTurn] = []

    def get_query(self) -> str:
        """Helper to extract query regardless of key used in request."""
        query = self.message or self.question
        return query.strip() if query else ""


class ChatResponse(BaseModel):
    answer: str
    sources: list[int]


class QuizRequest(BaseModel):
    file: str
    difficulty: str
    randomizer: int


# Health Check Endpoints
@app.get("/")
def read_root():
    return {"message": "Local Server is running smoothly!"}


@app.get("/health")
def health():
    return {"status": "ok", "index_loaded": engine is not None}


# PDF Upload & Indexing Endpoint
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    data_dir = "data"

    # Clear old uploaded PDFs
    if os.path.exists(data_dir):
        for filename in os.listdir(data_dir):
            file_to_delete = os.path.join(data_dir, filename)
            if os.path.isfile(file_to_delete):
                os.remove(file_to_delete)
    else:
        os.makedirs(data_dir, exist_ok=True)

    file_path = os.path.join(data_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    def event_stream():
        for update in rebuild_index_progress(data_dir=data_dir):
            yield json.dumps(update) + "\n"
        reload_rag_engine()

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")


# Chat / Voice Assistant Endpoint
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="Index not loaded. Please upload a PDF file first.",
        )
    
    user_query = req.get_query()
    if not user_query:
        raise HTTPException(status_code=400, detail="Message/Question cannot be empty.")

    history = [turn.model_dump() for turn in req.history]
    
    try:
        result = engine.answer(user_query, history=history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")


# Quiz Generation Endpoint
@app.post("/quiz")
def generate_quiz(req: QuizRequest):
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="Index not loaded. Please upload a PDF file first.",
        )
    
    try:
        questions = engine.generate_quiz(req.difficulty, req.randomizer)
        
        if not questions:
            raise HTTPException(status_code=500, detail="Failed to parse quiz from AI.")
            
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))