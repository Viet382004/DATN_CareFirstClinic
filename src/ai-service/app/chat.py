import json
import asyncio
from langchain_ollama import ChatOllama
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from .rag import get_retriever
from .intent import detect_intent, extract_booking_info
from .clinic_api import get_available_slots, book_appointment, get_doctors
import os

llm = ChatOllama(
    model=os.getenv("MODEL_NAME", "qwen2.5:7b"),
    base_url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
    temperature=0.3,
    streaming=True,
)

SYSTEM_PROMPT = """Bạn là 'Tâm' - nữ trợ lý AI y tế cực kỳ thân thiện, lễ phép và chuyên nghiệp của CareFirstClinic.

Nhiệm vụ:
- Tư vấn sức khỏe, chẩn đoán sơ bộ dựa trên triệu chứng.
- Trả lời các câu hỏi về giá cả, dịch vụ luôn kèm theo lời chúc sức khỏe.
- Hướng dẫn bệnh nhân đặt lịch khám.

Quy tắc:
- LUÔN LUÔN xưng "em" và gọi người dùng là "anh/chị/bạn".
- Nếu bệnh nhân kể triệu chứng quá nguy hiểm (đau tim, xuất huyết), hãy yêu cầu họ tới phòng cấp cứu gần nhất hoặc gọi 115 lập tức, đừng tư vấn dông dài.
- Trả lời bằng ngôn ngữ tiếng Việt tự nhiên, có dùng emoji (😊, 💊, 🏥) cho sinh động.

Thông tin hệ thống cung cấp:
{context}

Lịch sử trò chuyện:
{history}

Người dùng: {input}
Tâm:"""


prompt = PromptTemplate(
    input_variables=["context", "history", "input"],
    template=SYSTEM_PROMPT
)

# Session memory store
_sessions: dict[str, ConversationBufferWindowMemory] = {}
_booking_state: dict[str, dict] = {}  # theo dõi trạng thái đặt lịch

def get_memory(session_id: str) -> ConversationBufferWindowMemory:
    if session_id not in _sessions:
        _sessions[session_id] = ConversationBufferWindowMemory(k=8)
    return _sessions[session_id]

async def _get_context(message: str, intent: str, session_id: str) -> str:
    """Lấy context từ RAG + API tuỳ intent"""
    parts = []

    # RAG context từ knowledge base
    try:
        retriever = get_retriever()
        docs = await asyncio.to_thread(retriever.get_relevant_documents, message)
        if docs:
            parts.append("Thông tin phòng khám:\n" + "\n".join(d.page_content for d in docs))
    except Exception as e:
        print(f"[chat] RAG error: {e}")

    # Thêm context từ C# API nếu liên quan
    if intent == "booking" or session_id in _booking_state:
        state = _booking_state.get(session_id, {})
        missing = [k for k in ["patient_name", "phone", "date", "time"] if k not in state]
        if missing:
            parts.append(f"Hướng dẫn hệ thống: Khách đang đặt lịch nhưng thiếu {', '.join(missing)}. Hãy hỏi thêm các thông tin này ngắn gọn.")
    elif intent == "doctor_info":
        doctors = await get_doctors()
        if doctors:
            doc_list = "\n".join(
                f"- BS. {d.get('name','?')} — {d.get('specialty','?')}"
                for d in doctors[:5]
            )
            parts.append(f"Danh sách bác sĩ:\n{doc_list}")

    return "\n\n".join(parts) if parts else "Không có thông tin bổ sung."

async def process_message(message: str, session_id: str):
    """Generator — yield từng token cho streaming"""
    memory = get_memory(session_id)
    intent = detect_intent(message)
    booking_info = extract_booking_info(message)

    # 1. Quản lý trạng thái đặt lịch
    state = _booking_state.get(session_id)
    
    # Nếu có ý định hủy khi đang book
    if state and (intent == "cancel" or intent == "deny"):
        _booking_state.pop(session_id, None)
        reply = "Đã hủy quá trình đặt lịch. Bạn cần hỗ trợ gì khác không?"
        memory.save_context({"input": message}, {"output": reply})
        yield json.dumps({"token": reply})
        yield json.dumps({"done": True, "intent": "cancel"})
        return

    # Nếu đang book hoặc phát hiện thông tin book
    if intent == "booking" or booking_info or state:
        if not state:
            _booking_state[session_id] = {}
            state = _booking_state[session_id]
        
        state.update(booking_info)

        # Kiểm tra đủ thông tin để đặt lịch
        required = ["patient_name", "phone", "date", "time"]
        if all(k in state for k in required):
            
            # Xử lý khi đủ thông tin
            if intent == "confirm" or state.get("confirmed"):
                # Đã xác nhận -> Gọi API
                result = await book_appointment(
                    state["patient_name"], state["phone"],
                    state["date"], state["time"],
                    state.get("reason", "Khám bệnh")
                )
                if result.get("success"):
                    reply = (
                        f"🎉 **Đã đặt lịch thành công!**\n\n"
                        f"- **Tên:** {state['patient_name']}\n"
                        f"- **Ngày:** {state['date']} lúc {state['time']}\n"
                        f"- **SĐT:** {state['phone']}\n\n"
                        f"Phòng khám sẽ liên hệ xác nhận trước 1 giờ."
                    )
                else:
                    reply = f"❌ Đặt lịch thất bại. Lỗi từ hệ thống: {result.get('error', 'Lỗi không xác định')}"
                
                _booking_state.pop(session_id, None)
                memory.save_context({"input": message}, {"output": reply})
                yield json.dumps({"token": reply})
                yield json.dumps({"done": True, "intent": intent})
                return
            else:
                # Chưa xác nhận -> Kiểm tra slot trống rồi hỏi xác nhận
                slots = await get_available_slots(state["date"])
                if state["time"] not in slots:
                    reply = (
                        f"Rất tiếc, khung giờ **{state['time']}** ngày {state['date']} đã kín lịch hoặc không khả dụng.\n"
                        f"Các giờ còn trống: **{', '.join(slots) if slots else 'Không còn slot nào'}**.\n"
                        f"Bạn vui lòng chọn một giờ khác nhé!"
                    )
                    state.pop("time") # Yêu cầu chọn lại giờ
                else:
                    reply = (
                        f"📋 **Xác nhận thông tin đặt lịch:**\n"
                        f"- Tên bệnh nhân: {state['patient_name']}\n"
                        f"- SĐT: {state['phone']}\n"
                        f"- Thời gian: {state['time']} ngày {state['date']}\n\n"
                        f"👉 Bạn có xác nhận đặt lịch với thông tin trên không? (Có / Không)"
                    )
                
                memory.save_context({"input": message}, {"output": reply})
                yield json.dumps({"token": reply})
                yield json.dumps({"done": True, "intent": "confirm_prompt"})
                return

    # 2. RAG & LLM sinh câu trả lời bình thường
    context = await _get_context(message, intent, session_id)
    history = memory.buffer

    full_prompt = prompt.format(
        context=context, history=history, input=message
    )

    full_reply = ""
    async for chunk in llm.astream(full_prompt):
        token = chunk.content
        if token:
            full_reply += token
            yield json.dumps({"token": token})

    memory.save_context({"input": message}, {"output": full_reply})
    yield json.dumps({"done": True, "intent": intent})