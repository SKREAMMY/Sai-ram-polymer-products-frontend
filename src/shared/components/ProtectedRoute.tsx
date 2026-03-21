import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { ROUTES } from "../../config/routes";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}
