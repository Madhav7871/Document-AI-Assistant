# Deep Learning Notes Chatbot (RAG)

A chatbot that answers questions about your `notes.pdf` using Retrieval-Augmented
Generation (RAG).

- **Backend:** Python + FastAPI + FAISS (vector search) + sentence-transformers
  (local embeddings) + Gemini API (answer generation)
- **Frontend:** React + Vite

## How it works

1. `ingest.py` reads the PDF, splits it into overlapping text chunks, embeds
   each chunk locally (no API calls needed for this step), and saves a FAISS
   vector index to disk.
2. The FastAPI server loads that index at startup.
3. When a user asks a question, the backend embeds the question, retrieves
   the most relevant chunks from the PDF, and sends them as context to
   Gemini, which writes a grounded, natural-language answer (citing page
   numbers).
4. The React app is a chat UI that talks to the backend over `/chat`.

## 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# open .env and paste your Gemini API key
```

Get a free Gemini API key at https://aistudio.google.com/apikey if you don't
have one yet.

**Build the index** (run once, and again whenever the PDF changes):

```bash
python ingest.py --pdf data/notes.pdf
```

This downloads a small local embedding model the first time (~90MB) and
creates `backend/index/faiss.index` + `backend/index/chunks.json`.

**Start the API:**

```bash
uvicorn main:app --reload --port 8000
```

Check it's alive: open http://localhost:8000/health — you should see
`{"status":"ok","index_loaded":true}`.

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env    # defaults to http://localhost:8000, edit if needed
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## 3. Using it

Ask anything about the PDF's content — e.g. "What is a CNN?" or "Explain the
vanishing gradient problem." Each answer shows the page numbers it was drawn
from, so you can jump back to the source material.

## Project structure

```
backend/
  data/notes.pdf       <- your source PDF
  ingest.py             <- one-time script: PDF -> chunks -> embeddings -> FAISS index
  rag.py                 <- retrieval + Gemini answer generation
  main.py                 <- FastAPI app (/chat, /health)
  requirements.txt
  .env.example
frontend/
  src/
    App.jsx              <- chat UI + logic
    components/
      Message.jsx
      TypingIndicator.jsx
    index.css
  package.json
  .env.example
```

## Customizing

- **Different PDF:** replace `backend/data/notes.pdf` and re-run `ingest.py`.
- **Answer quality/speed:** tune `TOP_K` (how many chunks are retrieved) and
  `CHUNK_SIZE`/`CHUNK_OVERLAP` (in `ingest.py`) — smaller chunks are more
  precise, larger chunks keep more context together.
- **Model:** change `GEMINI_MODEL` in `backend/.env` (defaults to
  `gemini-1.5-flash`).
- **Multiple PDFs:** loop `ingest.py`'s extraction over a folder of PDFs
  instead of a single file, and store the source filename alongside `page`
  in each chunk's metadata.

## Troubleshooting

- `503 Index not loaded` from `/chat` → you haven't run `ingest.py` yet, or it
  failed. Check the backend terminal output.
- CORS errors in the browser console → make sure `CORS_ORIGIN` in
  `backend/.env` matches the URL your frontend is running on.
- Answers seem off-topic → lower `CHUNK_SIZE` for more precise retrieval, or
  increase `TOP_K` in `rag.py` so more context is retrieved per question.
