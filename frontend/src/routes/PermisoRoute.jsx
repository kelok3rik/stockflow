import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PermisoRoute({ permiso, children }) {
  const { usuario } = useAuth();

  // Si no está logueado, redirige al login
  if (!usuario) return <Navigate to="/login" />;

  // Si no tiene el permiso requerido, redirige a no autorizado
  if (!usuario[permiso]) return <Navigate to="/no-autorizado" />;

  // Si tiene permiso, renderiza el componente hijo
  return children;
}
