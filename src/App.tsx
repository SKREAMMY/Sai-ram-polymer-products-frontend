import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { ROUTES } from "./config/routes";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import EmployeesPage from "./features/employees/pages/EmployeesPage";
import EmployeeDetailPage from "./features/employees/pages/EmployeeDetailPage";
import DailyAttendancePage from "./features/attendance/pages/DailyAttendacePage";
import PayrollPage from "./features/payroll/pages/PayrollPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Placeholder pages — we'll build these one by one

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
            <Route
              path={ROUTES.EMPLOYEE_DETAIL}
              element={<EmployeeDetailPage />}
            />
            <Route
              path={ROUTES.ATTENDANCE_DAILY}
              element={<DailyAttendancePage />}
            />
            <Route path={ROUTES.PAYROLL} element={<PayrollPage />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={ROUTES.DASHBOARD} replace />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
            borderRadius: "10px",
          },
        }}
      />
    </QueryClientProvider>
  );
}
