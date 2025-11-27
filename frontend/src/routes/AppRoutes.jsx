import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Productos from '../pages/Productos';
import NoAutorizado from '../pages/NoAutorizado';
import DashboardLayout from '../layouts/DashboardLayout';
import PermisoRoute from '../routes/PermisoRoute';

export default function AppRoutes() {
  const { user } = useAuth(); // <-- aquí estaba el error

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

        {/* Error permisos */}
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* Dashboard */}
        <Route path="/" element={user ? <DashboardLayout><Dashboard /></DashboardLayout> : <Navigate to="/login" />} />

        {/* Productos protegido por permiso inv_productos */}
        <Route 
          path="/productos" 
          element={
            <PermisoRoute permiso="inv_productos">
              <DashboardLayout><Productos /></DashboardLayout>
            </PermisoRoute>
          } 
        />

        {/* Otras rutas del menú usando el mismo patrón */}
      </Routes>
    </BrowserRouter>
  );
}
