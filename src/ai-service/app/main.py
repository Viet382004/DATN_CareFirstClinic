from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from .chat import process_message
from .rag import build_index
import os

app = FastAPI(title="CareFirstClinic AI Service", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Sau khi test ổn, thay bằng domain cụ thể
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "anonymous"

@app.on_event("startup")
async def startup():
    """Build FAISS index khi khởi động nếu chưa có"""
    faiss_path = "/app/data/faiss_index"
    if not os.path.exists(faiss_path):
        print("[startup] Building FAISS index...")
        build_index()

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": os.getenv("MODEL_NAME"),
        "ollama_url": os.getenv("OLLAMA_URL")
    }

@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    async def generate():
        async for chunk in process_message(req.message, req.session_id):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    from .chat import _sessions, _booking_state
    _sessions.pop(session_id, None)
    _booking_state.pop(session_id, None)
    return {"cleared": session_id}