import { createBrowserRouter, Navigate } from "react-router-dom";
import Homepage from "../modules/home/pages/Homepage";
import LoginPage from "../modules/auth/pages/LoginPage";
import RegisterPage from "../modules/auth/pages/RegisterPage";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

// Patient imports
import SelectSpecialty from "../modules/patient/booking/SelectSpecialty";
import SelectDoctor from "../modules/patient/booking/SelectDoctor";
import SelectTime from "../modules/patient/booking/SelectTime";
import PatientInfo from "../modules/patient/booking/PatientInfo";
import BookingSuccess from "../modules/patient/booking/BookingSuccess";
import ProfilePage from "../modules/patient/profile/pages/PatientProfilePage";
import MyAppointments from "../modules/patient/appointments/MyAppointments";

// Doctor imports
import DoctorLayout from "../modules/doctor/layout/DoctorLayout";
import DoctorDashboard from "../modules/doctor/pages/DoctorDashboard";
import DoctorProfilePage from "../modules/doctor/pages/DoctorProfilePage";
import DoctorSchedulePage from "../modules/doctor/pages/DoctorSchedulePage";
import DoctorAppointments from "../modules/doctor/pages/DoctorAppointments";

// Admin imports
import AdminLayout from "../modules/admin/layout/AdminLayout";
import Dashboard from "../modules/admin/pages/Dashboard";
import AdminAppointments from "../modules/admin/pages/AdminAppointments";
import AdminPatients from "../modules/admin/pages/AdminPatients";
import AdminDoctors from "../modules/admin/pages/AdminDoctors";
import AdminSpecialties from "../modules/admin/pages/AdminSpecialties";
import WalkInBooking from "../modules/admin/pages/WalkInBooking";
import AdminInventory from "../modules/admin/pages/AdminInventory";
import AdminBilling from "../modules/admin/pages/AdminBilling";
import AdminReports from "../modules/admin/pages/AdminReports";
import AdminSchedules from "../modules/admin/pages/AdminSchedules";
import AdminSettings from "../modules/admin/pages/AdminSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // ====================== PATIENT ROUTES ======================
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/appointments",
    element: (
      <ProtectedRoute>
        <MyAppointments />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking",
    element: (
      <ProtectedRoute>
        <SelectSpecialty />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/doctor",
    element: (
      <ProtectedRoute>
        <SelectDoctor />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/time",
    element: (
      <ProtectedRoute>
        <SelectTime />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/info",
    element: (
      <ProtectedRoute>
        <PatientInfo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/patient/booking/success",
    element: (
      <ProtectedRoute>
        <BookingSuccess />
      </ProtectedRoute>
    ),
  },

  // ====================== DOCTOR ROUTES ======================
  {
    path: "/doctor",
    element: (
      <ProtectedRoute requiredRoles={["Doctor"]}>
        <DoctorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DoctorDashboard />,
      },
      {
        path: "appointments",
        element: <DoctorAppointments />,
      },
      {
        path: "profile",
        element: <DoctorProfilePage />,
      },
      {
        path: "schedule",
        element: <DoctorSchedulePage />,
      },
    ],
  },

  // ====================== ADMIN ROUTES ======================
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRoles={["Admin", "SystemAdmin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "appointments",
        element: <AdminAppointments />,
      },
      {
        path: "patients",
        element: <AdminPatients />,
      },
      {
        path: "doctors",
        element: <AdminDoctors />,
      },
      {
        path: "specialties",
        element: <AdminSpecialties />,
      },
      {
        path: "walk-in",
        element: <WalkInBooking />,
      },
      {
        path: "inventory",
        element: <AdminInventory />,
      },
      {
        path: "billing",
        element: <AdminBilling />,
      },
      {
        path: "reports",
        element: <AdminReports />,
      },
      {
        path: "schedule",
        element: <AdminSchedules />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
]);

export default router;