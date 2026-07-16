import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute({ roles }: { roles?: Array<"user" | "doctor" | "admin"> }) {
  const { session } = useAuth();
  const location = useLocation();
  if (!session)
    return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(session.role))
    return <Navigate to="/upload/identity" replace />;
  return <Outlet />;
}
