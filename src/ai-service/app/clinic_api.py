import httpx
import os
from typing import Optional

CSHARP_API = os.getenv("CSHARP_API_URL", "http://localhost:5000")

async def get_available_slots(date: str) -> list[str]:
    """Gọi API C# lấy slot trống — thay endpoint cho đúng với code của bạn"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                f"{CSHARP_API}/api/appointments/available-slots",
                params={"date": date}
            )
            res.raise_for_status()
            data = res.json()
            # Tuỳ response của C# API bạn, adjust ở đây
            return data.get("slots", data if isinstance(data, list) else [])
    except Exception as e:
        print(f"[clinic_api] get_slots error: {e}")
        return ["08:00", "09:00", "10:00", "14:00", "15:00"]  # fallback

async def book_appointment(
    patient_name: str,
    phone: str,
    date: str,
    time: str,
    reason: str = ""
) -> dict:
    """Gọi API C# tạo lịch hẹn — thay endpoint cho đúng"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.post(
                f"{CSHARP_API}/api/appointments",
                json={
                    "patientName": patient_name,
                    "phone": phone,
                    "appointmentDate": date,
                    "appointmentTime": time,
                    "reason": reason
                }
            )
            res.raise_for_status()
            return {"success": True, "data": res.json()}
    except httpx.HTTPStatusError as e:
        return {"success": False, "error": str(e)}
    except Exception as e:
        return {"success": False, "error": "Không thể kết nối hệ thống đặt lịch"}

async def get_doctors(specialty: Optional[str] = None) -> list[dict]:
    """Lấy danh sách bác sĩ"""
    try:
        params = {"specialty": specialty} if specialty else {}
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(f"{CSHARP_API}/api/doctors", params=params)
            res.raise_for_status()
            return res.json()
    except Exception:
        return []

async def get_patient_appointments(phone: str) -> list[dict]:
    """Lấy lịch hẹn của bệnh nhân theo SĐT"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                f"{CSHARP_API}/api/appointments",
                params={"phone": phone}
            )
            res.raise_for_status()
            return res.json()
    except Exception:
        return []