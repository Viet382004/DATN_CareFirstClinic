import httpx
import os
from typing import Optional, List, Dict, Any

CSHARP_API = os.getenv("CSHARP_API_URL", "http://localhost:5293")

async def get_me(token: str) -> Optional[Dict[str, Any]]:
    """Lấy thông tin profile bệnh nhân từ token"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                f"{CSHARP_API}/api/patient/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            res.raise_for_status()
            return res.json()
    except Exception as e:
        print(f"[clinic_api] get_me error: {e}")
        return None

async def get_doctors(specialty: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lấy danh sách bác sĩ"""
    try:
        params = {"specialty": specialty} if specialty else {}
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(f"{CSHARP_API}/api/doctor", params=params)
            res.raise_for_status()
            data = res.json()
            return data.get("items", []) if isinstance(data, dict) else data
    except Exception as e:
        print(f"[clinic_api] get_doctors error: {e}")
        return []

async def get_available_slots(date: str, doctor_id: str, token: str) -> List[Dict[str, Any]]:
    """Lấy danh sách slot trống của bác sĩ theo ngày"""
    try:
        # Format date if needed (C# expects YYYY-MM-DD or similar)
        # Assuming date is already in a compatible format or we handle it here
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                f"{CSHARP_API}/api/timeslot/doctor/{doctor_id}/date/{date}",
                headers={"Authorization": f"Bearer {token}"}
            )
            res.raise_for_status()
            slots = res.json()
            # Trả về các slot chưa được đặt (IsBooked == False)
            return [s for s in slots if not s.get("isBooked", True)]
    except Exception as e:
        print(f"[clinic_api] get_slots error: {e}")
        return []

async def book_appointment(token: str, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
    """Gọi API C# tạo lịch hẹn với Token và DTO chuẩn"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # Backend mong đợi CreateAppointmentDTO
            # { "timeSlotId": "...", "reason": "...", "fullName": "...", "dob": "...", "gender": "...", "phone": "..." }
            res = await client.post(
                f"{CSHARP_API}/api/appointment",
                headers={"Authorization": f"Bearer {token}"},
                json=appointment_data
            )
            res.raise_for_status()
            return {"success": True, "data": res.json()}
    except httpx.HTTPStatusError as e:
        try:
            error_msg = e.response.json().get("message", str(e))
        except:
            error_msg = str(e)
        return {"success": False, "error": error_msg}
    except Exception as e:
        print(f"[clinic_api] book_appointment error: {e}")
        return {"success": False, "error": "Không thể kết nối hệ thống đặt lịch"}

async def get_patient_appointments(token: str) -> List[Dict[str, Any]]:
    """Lấy lịch hẹn của bệnh nhân hiện tại"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(
                f"{CSHARP_API}/api/appointment/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            res.raise_for_status()
            return res.json().get("items", [])
    except Exception as e:
        print(f"[clinic_api] get_patient_appointments error: {e}")
        return []