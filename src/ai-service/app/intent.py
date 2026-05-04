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

    # 2. Số điện thoại
    phone_match = re.search(r'(0[3-9]\d{8})', text)
    if phone_match:
        info["phone"] = phone_match.group(1)

    # 3. Ngày
    date_match = re.search(r'(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?', text)
    if date_match:
        d, m = date_match.group(1), date_match.group(2)
        y = date_match.group(3) or str(datetime.now().year)
        if len(y) == 2: y = "20" + y
        try:
            dt = datetime(int(y), int(m), int(d))
            info["date"] = dt.strftime("%Y-%m-%d")
        except: pass
    else:
        now = datetime.now()
        dt = None
        if "hôm nay" in text_lower or "nay" in text_lower:
            dt = now
        elif "ngày mai" in text_lower or "mai" in text_lower:
            dt = now + timedelta(days=1)
        elif "ngày mốt" in text_lower or "mốt" in text_lower:
            dt = now + timedelta(days=2)
        
        if dt:
            info["date"] = dt.strftime("%Y-%m-%d")

    # 4. Giờ (mở rộng để bắt "9h", "9 giờ", "09:00", "9:30")
    time_match = re.search(r'(\d{1,2})(?:[:\.h](\d{2}))?\s*(?:giờ|h\b)?', text_lower)
    if time_match:
        h = int(time_match.group(1))
        m = int(time_match.group(2) or 0)
        if 7 <= h <= 19: # Giờ làm việc thông thường
            info["time"] = f"{h:02d}:{m:02d}"

    # 5. Bác sĩ / Chuyên khoa
    # Tìm kiếm các từ khóa chuyên khoa phổ biến
    specialties = ["nội", "ngoại", "nhi", "sản", "da liễu", "mắt", "tai mũi họng", "răng hàm mặt", "tâm thần", "tim mạch"]
    for sp in specialties:
        if sp in text_lower:
            info["specialty"] = sp
            break

    # Tìm tên bác sĩ (Thường đi sau từ "bác sĩ" hoặc "bs")
    doc_match = re.search(r'(?:bác sĩ|bs)\s+([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐƠƯ][a-zàáâãèéêìíòóôõùúýăđơư\s]{1,30})', text)
    if doc_match:
        info["doctor_name"] = doc_match.group(1).strip()

    return info