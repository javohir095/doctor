import { Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "@/pages/login/LoginPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { StaffPage } from "@/pages/staff/StaffPage"
import { PatientsListPage } from "@/pages/patients/PatientsListPage"
import { PatientDetailPage } from "@/pages/patients/PatientDetailPage"
import { ServicesPage } from "@/pages/services/ServicesPage"
import { AppointmentsPage } from "@/pages/appointments/AppointmentsPage"
import { BotSettingsPage } from "@/pages/settings/BotSettingsPage"
import { BranchesPage } from "@/pages/branches/BranchesPage"
import { AllStaffPage } from "@/pages/superadmin/AllStaffPage"
import { ProtectedLayout } from "./ProtectedLayout"
import { RoleGate } from "./RoleGate"

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/patients"
          element={
            <RoleGate roles={["owner", "doctor", "admin"]}>
              <PatientsListPage />
            </RoleGate>
          }
        />
        <Route
          path="/patients/:patientId"
          element={
            <RoleGate roles={["owner", "doctor", "admin"]}>
              <PatientDetailPage />
            </RoleGate>
          }
        />
        <Route
          path="/appointments"
          element={
            <RoleGate roles={["owner", "doctor", "admin"]}>
              <AppointmentsPage />
            </RoleGate>
          }
        />
        <Route
          path="/services"
          element={
            <RoleGate roles={["owner"]}>
              <ServicesPage />
            </RoleGate>
          }
        />
        <Route
          path="/branches"
          element={
            <RoleGate roles={["owner"]}>
              <BranchesPage />
            </RoleGate>
          }
        />
        <Route
          path="/staff"
          element={
            <RoleGate roles={["owner"]}>
              <StaffPage />
            </RoleGate>
          }
        />
        <Route
          path="/settings/bot"
          element={
            <RoleGate roles={["owner"]}>
              <BotSettingsPage />
            </RoleGate>
          }
        />
        <Route
          path="/superadmin/staff"
          element={
            <RoleGate roles={["superadmin"]}>
              <AllStaffPage />
            </RoleGate>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
