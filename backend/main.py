import json
import os
import shutil

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

from ingest import rebuild_index_progress  # noqa: E402
from rag import RagEngine  # noqa: E402

app = FastAPI(title="Document AI Chatbot")

# 🚨 YAHAN FIX KIYA HAI: allow_origins=["*"] kar diya taaki Fetch Error na aaye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine: RagEngine | None = None


def reload_rag_engine():
    global engine
    try:
        engine = RagEngine()
        print("✅ RagEngine successfully reloaded.")
    except Exception as e:
        print(f"⚠️ [engine loading warning] {e}")
        engine = None


@app.on_event("startup")
def load_engine():
    reload_rag_engine()


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatTurn] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list[int]


class QuizRequest(BaseModel):
    file: str
    difficulty: str
    randomizer: int


@app.get("/")
def read_root():
    return {"message": "Server is running"}


@app.get("/health")
def health():
    return {"status": "ok", "index_loaded": engine is not None}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    data_dir = "data"

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


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if engine is None:
        raise HTTPException(
            status_code=503,
            detail="Index not loaded. Please upload a PDF file first.",
        )
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    history = [turn.model_dump() for turn in req.history]
    result = engine.answer(req.message, history=history)
    return result


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