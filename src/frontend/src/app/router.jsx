import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "../modules/home/pages/Homepage";
import Login from "../modules/auth/pages/Login";
import Register from "../modules/auth/pages/Register";
import PatientPortal from "../modules/patient/pages/PatientPortal";
import PrivateRoute from "../routes/PrivateRoute";
import SelectSpecialty from "../modules/patient/pages/booking/SelectSpecialty";
import SelectDoctor from "../modules/patient/pages/booking/SelectDoctor";
import SelectTime from "../modules/patient/pages/booking/SelectTime";
import PatientInfo from "../modules/patient/pages/booking/PatientInfo";
import BookingSuccess from "../modules/patient/pages/booking/BookingSuccess";
import DoctorDashboard from "../modules/doctor/pages/dashboard/Doctordashboard";
import AdminDashboard from "../modules/admin/pages/dashboard/Admindashboard";
import PatientAppointments from "../modules/patient/pages/appoinment/Patientappointments";
import Patientprofile from "../modules/patient/pages/profile/Patientprofile";
import { useAuth } from "../contexts/AuthContext";




const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Homepage />} />
        <Route path="/patient/booking/specialty" element={<SelectSpecialty/>} />
        <Route path="/patient/booking/doctor" element={<SelectDoctor/>} />
        <Route path="/patient/booking/time" element={<SelectTime/>} />
        <Route path="/patient/booking/info" element={<PatientInfo/>} />
        <Route path="/patient/booking/success" element={<BookingSuccess/>} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/profile" element={<Patientprofile/>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient"
          element={
            <PrivateRoute roles={["patient"]}>
              <PatientPortal />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;