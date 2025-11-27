import { useAuth } from "../context/AuthContext";

// Este componente recibe un permiso y children
export default function Permiso({ permiso, children }) {
  const { usuario } = useAuth();

  // Si el usuario tiene el permiso, renderiza los children
  if (usuario && usuario[permiso]) {
    return children;
  }

  // Si no tiene permiso, no renderiza nada
  return null;
}
