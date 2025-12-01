import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PermisoRoute({ permiso, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  // ✅ MIRANDO DONDE REALMENTE ESTÁ EL PERMISO
  if (!user.permisos || !user.permisos[permiso]) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
}
