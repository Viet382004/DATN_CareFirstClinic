import { createBrowserRouter, Navigate } from "react-router-dom";
import Homepage from "../modules/home/pages/Homepage";
import SelectSpecialty from "../modules/patient/book/SelectSpecialty";
import SelectDoctor from "../modules/patient/book/SelectDoctor";
import SelectTime from "../modules/patient/book/SelectTime";
import BookingSuccess from "../modules/patient/book/BookingSuccess";
import PatientInfo from "../modules/patient/book/PatientInfo";
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import ProfilePage from "../modules/patient/profile/pages/PatientProfilePage";
import MyAppointments from "../modules/patient/appointments/MyAppointments";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/profile",
    Component: () => (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/appointments",
    Component: () => (
      <ProtectedRoute>
        <MyAppointments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking",
    Component: () => (
      <ProtectedRoute>
        <Navigate to="/patient/booking/specialty" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/specialty",
    Component: () => (
      <ProtectedRoute>
        <SelectSpecialty />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/doctor",
    Component: () => (
      <ProtectedRoute>
        <SelectDoctor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/time",
    Component: () => (
      <ProtectedRoute>
        <SelectTime />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/info",
    Component: () => (
      <ProtectedRoute>
        <PatientInfo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/success",
    Component: () => (
      <ProtectedRoute>
        <BookingSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/info",
    Component: () => (
      <ProtectedRoute>
        <PatientInfo />
      </ProtectedRoute>
    ),
  }
]);

export default router;