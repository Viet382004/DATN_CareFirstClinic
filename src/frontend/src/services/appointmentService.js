import axiosClient from "./axiosClient";

// tạo lịch hẹn
export const createAppointment = (data) => {
  return axiosClient.post("/appointments", data);
};

// lấy khung giờ trống
export const getAvailableSlots = (doctorId, date) => {
  return axiosClient.get("/appointments/available-slots", {
    params: {
      doctorId,
      date
    }
  });
};