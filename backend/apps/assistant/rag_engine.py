"""
RAG Engine with ChromaDB vector store and sentence-transformers multilingual embeddings.
"""

import os
import re
from pathlib import Path
from typing import Any, Dict, List, Tuple

from django.conf import settings

_CHROMA_CLIENT = None
_COLLECTION = None
_EMBED_MODEL = None

COLLECTION_NAME = "mrittika_agricultural_knowledge"
RELEVANCE_DISTANCE_THRESHOLD = 0.85  # Chroma cosine distance threshold (lower is closer)


def get_embed_model():
    global _EMBED_MODEL
    if _EMBED_MODEL is None:
        from sentence_transformers import SentenceTransformer
        model_name = getattr(settings, "EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
        _EMBED_MODEL = SentenceTransformer(model_name)
    return _EMBED_MODEL


def get_collection():
    global _CHROMA_CLIENT, _COLLECTION
    if _COLLECTION is not None:
        return _COLLECTION

    import chromadb
    from chromadb.config import Settings

    persist_dir = str(settings.CHROMA_PERSIST_DIR)
    os.makedirs(persist_dir, exist_ok=True)

    _CHROMA_CLIENT = chromadb.PersistentClient(
        path=persist_dir,
        settings=Settings(anonymized_telemetry=False),
    )
    _COLLECTION = _CHROMA_CLIENT.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    return _COLLECTION


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 80) -> List[str]:
    """Splits document text into overlapping chunks, preferring paragraph/sentence breaks."""
    clean = text.strip()
    if not clean:
        return []

    paragraphs = clean.split("\n\n")
    chunks = []
    current_chunk = ""

    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue
        if len(current_chunk) + len(p_clean) < chunk_size:
            current_chunk += ("\n\n" + p_clean if current_chunk else p_clean)
        else:
            if current_chunk:
                chunks.append(current_chunk)
            if len(p_clean) > chunk_size:
                # Sub-split long paragraph by sentences
                sentences = re.split(r"(?<=[।!?.\n])\s+", p_clean)
                sub_chunk = ""
                for s in sentences:
                    if len(sub_chunk) + len(s) < chunk_size:
                        sub_chunk += (" " + s if sub_chunk else s)
                    else:
                        if sub_chunk:
                            chunks.append(sub_chunk)
                        sub_chunk = s
                current_chunk = sub_chunk
            else:
                current_chunk = p_clean

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


def ingest_document(file_path: Path) -> int:
    """Ingests a markdown or text file into ChromaDB with embeddings."""
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract source & page metadata if present
    filename = file_path.name
    source_title = filename
    page = 1

    # Detect sample source citations in headers
    src_match = re.search(r"উৎস:\s*([^\[]+)\[([^,\]]+),\s*পৃ\.\s*([^\]]+)\]", content)
    if src_match:
        source_title = f"{src_match.group(1).strip()} [{src_match.group(2).strip()}]"
        page = src_match.group(3).strip()

    chunks = chunk_text(content)
    if not chunks:
        return 0

    embedder = get_embed_model()
    collection = get_collection()

    # Prefix with 'passage: ' for e5 / asymmetric embedding contracts
    passages = [f"passage: {c}" for c in chunks]
    embeddings = embedder.encode(passages, normalize_embeddings=True).tolist()

    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "source": source_title,
            "filename": filename,
            "page": str(page),
            "chunk_index": i,
            "is_sample": "[SAMPLE - NOT VERIFIED]" in content or "SAMPLE" in filename.upper(),
        }
        for i in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )
    return len(chunks)


def query_knowledge_base(query_text: str, top_k: int = 3) -> Tuple[List[Dict[str, Any]], bool]:
    """Retrieves relevant passages for a question using 'query: ' prefix."""
    collection = get_collection()
    count = collection.count()
    if count == 0:
        return [], True  # Empty store -> fallback

    embedder = get_embed_model()
    # Asymmetric prefix
    q_prefixed = f"query: {query_text.strip()}"
    q_emb = embedder.encode([q_prefixed], normalize_embeddings=True).tolist()

    results = collection.query(
        query_embeddings=q_emb,
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    retrieved = []
    is_low_confidence = False

    for doc, meta, dist in zip(docs, metas, distances):
        retrieved.append({
            "content": doc,
            "source": meta.get("source", "Agricultural Document"),
            "filename": meta.get("filename", ""),
            "page": meta.get("page", "1"),
            "is_sample": meta.get("is_sample", True),
            "distance": float(dist),
        })

    if not retrieved or retrieved[0]["distance"] > RELEVANCE_DISTANCE_THRESHOLD:
        is_low_confidence = True

    return retrieved, is_low_confidence
