import re
from datetime import datetime, timedelta

INTENTS = {
    "booking": [
        "đặt lịch", "đặt hẹn", "hẹn khám", "muốn khám",
        "lịch khám", "book", "đăng ký khám", "xin lịch"
    ],
    "cancel": [
        "hủy lịch", "hủy hẹn", "đổi lịch", "dời lịch"
    ],
    "doctor_info": [
        "bác sĩ nào", "doctor", "chuyên khoa", "bác sĩ chuyên"
    ],
    "schedule_info": [
        "giờ mở cửa", "mấy giờ", "lịch làm việc", "thứ mấy", "slot"
    ],
    "price_info": [
        "giá", "phí", "bao nhiêu tiền", "chi phí", "tiền khám"
    ],
    "confirm": [
        "có", "ok", "đúng", "chuẩn", "xác nhận", "chốt", "vâng", "dạ"
    ],
    "deny": [
        "không", "sai", "chưa đúng", "hủy", "thôi"
    ]
}

def detect_intent(text: str) -> str:
    text_lower = text.lower()
    for intent, keywords in INTENTS.items():
        # Check exact words or phrases
        if any(re.search(rf"\b{kw}\b", text_lower) for kw in keywords):
            return intent
    return "consultation"

def extract_booking_info(text: str) -> dict:
    """Trích xuất thông tin đặt lịch từ câu chat"""
    info = {}
    text_lower = text.lower()

    # 1. Tên (cải thiện để nhận diện tốt hơn)
    name_match = re.search(
        r'(?:tên\s*(?:là|:)?\s*|tên tôi là\s*|anh là\s*|chị là\s*|em là\s*)([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯ][a-zàáâãèéêìíòóôõùúýăđơư\s]{1,30})',
        text, re.IGNORECASE
    )
    if name_match:
        info["patient_name"] = name_match.group(1).strip()

    # 2. Số điện thoại (giữ nguyên vì regex này khá chuẩn)
    phone_match = re.search(r'(0[3-9]\d{8})', text)
    if phone_match:
        info["phone"] = phone_match.group(1)

    # 3. Ngày (xử lý thêm các từ khóa thông dụng)
    date_match = re.search(r'(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)', text)
    if date_match:
        info["date"] = date_match.group(1)
    else:
        now = datetime.now()
        if "hôm nay" in text_lower or "nay" in text_lower:
            info["date"] = now.strftime("%d/%m/%Y")
        elif "ngày mai" in text_lower or "mai" in text_lower:
            info["date"] = (now + timedelta(days=1)).strftime("%d/%m/%Y")
        elif "ngày mốt" in text_lower or "mốt" in text_lower:
            info["date"] = (now + timedelta(days=2)).strftime("%d/%m/%Y")

    # 4. Giờ (mở rộng để bắt "9h", "9 giờ", "09:00")
    time_match = re.search(r'(\d{1,2}(?:[:\.]\d{2})?)\s*(?:giờ|h\b)', text_lower)
    if time_match:
        time_str = time_match.group(1).replace('.', ':')
        if ':' not in time_str:
            time_str += ":00"
        # Đảm bảo format hh:mm (ví dụ 9:00 -> 09:00)
        parts = time_str.split(':')
        info["time"] = f"{int(parts[0]):02d}:{parts[1]}"
    
    return info