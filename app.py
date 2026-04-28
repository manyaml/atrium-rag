"""
RAG Pipeline Testing Web App
FastAPI backend — replace the `query_rag_pipeline` stub with your real implementation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Any, Optional
import uvicorn
import time
import random

app = FastAPI(title="RAG Pipeline Tester")

# ─────────────────────────────────────────────
# Configure your domains here
# ─────────────────────────────────────────────
DOMAINS = [
    {"id": "general",    "label": "General",          "description": "General knowledge base"},
    {"id": "legal",      "label": "Legal",            "description": "Legal documents & contracts"},
    {"id": "finance",    "label": "Finance",          "description": "Financial reports & data"},
    {"id": "hr",         "label": "HR & Policy",      "description": "HR policies & procedures"},
    {"id": "technical",  "label": "Technical Docs",   "description": "Engineering & technical docs"},
]


# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str
    domain: str
    use_history: bool = False
    metadata: dict[str, Any] = {}
    conversation_id: Optional[str] = None


class SearchResult(BaseModel):
    id: str
    content: str
    source: str
    score: float
    metadata: dict[str, Any] = {}


class QueryResponse(BaseModel):
    answer: str
    search_results: list[SearchResult]
    domain: str
    query: str
    use_history: bool
    latency_ms: int
    conversation_id: str


class SearchRequest(BaseModel):
    query: str
    domain: str
    k: int = 6
    min_score: float = 0.0


class SearchResponse(BaseModel):
    results: list[SearchResult]
    domain: str
    query: str
    k: int
    latency_ms: int


# ─────────────────────────────────────────────
# ★ REPLACE THIS FUNCTION with your RAG pipeline
# ─────────────────────────────────────────────
def query_rag_pipeline(
    query: str,
    domain: str,
    use_history: bool,
    metadata: dict,
    conversation_id: Optional[str],
) -> dict:
    """
    Stub implementation. Replace with your actual RAG pipeline call.

    Expected return shape:
    {
        "answer": str,
        "search_results": [
            {
                "id": str,
                "content": str,
                "source": str,
                "score": float (0.0–1.0),
                "metadata": dict
            },
            ...
        ],
        "conversation_id": str   # return same id to preserve history
    }
    """
    time.sleep(0.5)  # simulate latency

    # --- stub data ---
    stub_results = [
        {
            "id": f"doc_{i}",
            "content": (
                f"This is a retrieved chunk #{i} from the '{domain}' domain. "
                "In a real deployment this would contain actual document text "
                "retrieved by your vector search or BM25 index. "
                "The relevance score indicates how closely this chunk matches your query."
            ),
            "source": f"documents/{domain}/sample_doc_{i}.pdf",
            "score": round(random.uniform(0.6, 0.99), 3),
            "metadata": {
                "page": i * 2 + 1,
                "section": f"Section {i + 1}",
                "author": "Sample Author",
            },
        }
        for i in range(1, 4)
    ]
    stub_results.sort(key=lambda x: x["score"], reverse=True)

    history_note = " (conversation history is enabled)" if use_history else ""
    meta_note = f" Metadata received: {metadata}." if metadata else ""

    return {
        "answer": (
            f"[STUB] This is a placeholder answer for the query: \"{query}\" "
            f"in the '{domain}' domain{history_note}.{meta_note}\n\n"
            "Replace the `query_rag_pipeline` function in app.py with your "
            "actual RAG pipeline to see real results here."
        ),
        "search_results": stub_results,
        "conversation_id": conversation_id or f"conv_{int(time.time()*1000)}",
    }


# ─────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────
@app.get("/api/domains")
def get_domains():
    return {"domains": DOMAINS}


@app.post("/api/query", response_model=QueryResponse)
def query(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    domain_ids = [d["id"] for d in DOMAINS]
    if req.domain not in domain_ids:
        raise HTTPException(status_code=400, detail=f"Unknown domain: {req.domain}")

    start = time.time()
    try:
        result = query_rag_pipeline(
            query=req.query,
            domain=req.domain,
            use_history=req.use_history,
            metadata=req.metadata,
            conversation_id=req.conversation_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    latency_ms = int((time.time() - start) * 1000)

    return QueryResponse(
        answer=result["answer"],
        search_results=[SearchResult(**r) for r in result["search_results"]],
        domain=req.domain,
        query=req.query,
        use_history=req.use_history,
        latency_ms=latency_ms,
        conversation_id=result["conversation_id"],
    )


@app.post("/api/search", response_model=SearchResponse)
def search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    domain_ids = [d["id"] for d in DOMAINS]
    if req.domain not in domain_ids:
        raise HTTPException(status_code=400, detail=f"Unknown domain: {req.domain}")

    start = time.time()
    try:
        result = query_rag_pipeline(
            query=req.query,
            domain=req.domain,
            use_history=False,
            metadata={"search_only": True, "k": req.k},
            conversation_id=None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    latency_ms = int((time.time() - start) * 1000)
    results = [SearchResult(**r) for r in result["search_results"]]
    results = [r for r in results if r.score >= req.min_score]
    results = sorted(results, key=lambda r: r.score, reverse=True)[: req.k]

    return SearchResponse(
        results=results,
        domain=req.domain,
        query=req.query,
        k=req.k,
        latency_ms=latency_ms,
    )


# ─────────────────────────────────────────────
# Serve static frontend
# ─────────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return FileResponse("static/index.html")


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
