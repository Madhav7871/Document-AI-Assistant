import json
import os
import re
import glob

import faiss
import numpy as np
import pdfplumber
from sentence_transformers import SentenceTransformer

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 900
CHUNK_OVERLAP = 150
INDEX_DIR = os.path.join(os.path.dirname(__file__), "index")


def extract_pages(pdf_path: str):
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            text = re.sub(r"\s+", " ", text).strip()
            if text:
                pages.append((i + 1, text))
    return pages


def chunk_pages(pages, filename, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    for page_num, text in pages:
        start = 0
        while start < len(text):
            end = start + chunk_size
            piece = text[start:end]
            if piece.strip():
                chunks.append({"file": filename, "page": page_num, "text": piece.strip()})
            if end >= len(text):
                break
            start = end - overlap
    return chunks


def rebuild_index_progress(data_dir="data"):
    """
    Yields progress dicts with status text and percentage so FastAPI can stream live updates to React.
    """
    os.makedirs(INDEX_DIR, exist_ok=True)
    pdf_files = glob.glob(os.path.join(data_dir, "*.pdf"))

    if not pdf_files:
        yield {"status": "No PDF found", "progress": 0, "done": True, "error": True}
        return

    yield {"status": "Reading PDF document...", "progress": 10}

    all_chunks = []
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        pages = extract_pages(pdf_path)
        chunks = chunk_pages(pages, filename)
        all_chunks.extend(chunks)

    if not all_chunks:
        yield {"status": "No readable text found in PDF.", "progress": 0, "done": True, "error": True}
        return

    yield {"status": f"Extracted {len(all_chunks)} text chunks. Loading model...", "progress": 25}

    model = SentenceTransformer(EMBED_MODEL_NAME)
    texts = [c["text"] for c in all_chunks]

    batch_size = 32
    total_batches = (len(texts) + batch_size - 1) // batch_size
    all_embeddings = []

    # Process in batches and yield progress back to frontend
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i : i + batch_size]
        batch_emb = model.encode(batch_texts, show_progress_bar=False, convert_to_numpy=True)
        all_embeddings.append(batch_emb)

        current_batch = (i // batch_size) + 1
        # Calculate percentage scaling between 30% and 85%
        calc_progress = 30 + int((current_batch / total_batches) * 55)
        yield {
            "status": f"Embedding chunks: batch {current_batch}/{total_batches} ({calc_progress}%)",
            "progress": calc_progress,
        }

    embeddings = np.vstack(all_embeddings).astype("float32")
    faiss.normalize_L2(embeddings)

    yield {"status": "Building FAISS index...", "progress": 90}

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index, os.path.join(INDEX_DIR, "faiss.index"))
    with open(os.path.join(INDEX_DIR, "chunks.json"), "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False)

    yield {"status": "PDF successfully processed and ready!", "progress": 100, "done": True}