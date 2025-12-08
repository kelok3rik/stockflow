import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Páginas
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Productos from '../pages/Productos/ProductosPage';
import AlmacenesPage from '../pages/Almacenes/AlmacenesPage';
import UbicacionesPage from '../pages/Ubicaciones/UbicacionesPage'
import DepartamentosPage from '../pages/Departamentos/DepartamentosPage';
import GruposPage from '../pages/Grupos/GruposPage';
import TiposMovimientoPage from '../pages/TiposMovimientos/TiposMovimientosPage';
import ClientesPage from '../pages/Clientes/ClientesPage';
import ProveedoresPage from '../pages/Proveedores/ProveedoresPage';
import Usuarios from '../pages/Usuarios/UsuariosPage';
import UsuariosVentanasPage from '../pages/Usuarios/usuariosVentanasPage.jsx';
import EmpresasPage from '../pages/Empresas/EmpresasPage.jsx';
import RolesPage from '../pages/Roles/RolesPage.jsx';
import MonedasPage from '../pages/Monedas/MonedasPage.jsx';
import CondicionesPagoPage from '../pages/CondicionesPagos/CondicionesPagoPage.jsx';



import PosPage from '../pages/Factura/PosPage.jsx';
import CotizacionPage from '../pages/Cotizaciones/CotizacionPage.jsx';

import NoAutorizado from '../pages/NoAutorizado';


// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Seguridad por permisos
import PermisoRoute from '../routes/PermisoRoute';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        {/* NO AUTORIZADO */}
        <Route
          path="/no-autorizado"
          element={<NoAutorizado />}
        />

        {/* DASHBOARD PRINCIPAL */}
        <Route
          path="/"
          element={
            user
              ? <DashboardLayout><Dashboard /></DashboardLayout>
              : <Navigate to="/login" />
          }
        />

        {/* PRODUCTOS - INVENTARIO */}
        <Route
          path="/inventario/productos"
          element={
            <PermisoRoute permiso="inv_productos">
              <DashboardLayout>
                <Productos />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/inventario/almacenes"
          element={
            <PermisoRoute permiso="inv_almacenes">
              <DashboardLayout>
                <AlmacenesPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/inventario/ubicaciones"
          element={
            <PermisoRoute permiso="inv_ubicaciones">
              <DashboardLayout>
                <UbicacionesPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/inventario/departamentos"
          element={
            <PermisoRoute permiso="inv_departamentos">
              <DashboardLayout>
                <DepartamentosPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/inventario/grupos"
          element={
            <PermisoRoute permiso="inv_grupos">
              <DashboardLayout>
                <GruposPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/inventario/tipos-movimientos"
          element={
            <PermisoRoute permiso="inv_movimientos">
              <DashboardLayout>
                <TiposMovimientoPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/cxc/clientes"
          element={
            <PermisoRoute permiso="cxc_clientes">
              <DashboardLayout>
                <ClientesPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/cxp/proveedores"
          element={
            <PermisoRoute permiso="cxp_proveedores">
              <DashboardLayout>
                <ProveedoresPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/config/usuarios"
          element={
            <PermisoRoute permiso="conf_usuario">
              <DashboardLayout>
                <Usuarios />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/config/usuario-ventana"
          element={
            <PermisoRoute permiso="conf_usuario">
              <DashboardLayout>
                <UsuariosVentanasPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/config/empresa"
          element={
            <PermisoRoute permiso="conf_empresa">
              <DashboardLayout>
                <EmpresasPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/config/roles"
          element={
            <PermisoRoute permiso="conf_roles">
              <DashboardLayout>
                <RolesPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/config/moneda"
          element={
            <PermisoRoute permiso="conf_moneda">
              <DashboardLayout>
                <MonedasPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/config/condicion"
          element={
            <PermisoRoute permiso="conf_condicion">
              <DashboardLayout>
                <CondicionesPagoPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/procesos/cotizacion"
          element={
            <PermisoRoute permiso="inv_cotizaciones">
              <DashboardLayout>
                <CotizacionPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />

        <Route
          path="/procesos/facturacion"
          element={
            <PermisoRoute permiso="inv_facturacion">
              <DashboardLayout>
                <PosPage />
              </DashboardLayout>
            </PermisoRoute>
          }
        />








        {/* RUTAS FUTURAS (ejemplo)
        <Route path="/inventario/almacenes" ... />
        <Route path="/cxp/proveedores" />
        <Route path="/cxc/clientes" />
        */}

      </Routes>
    </BrowserRouter>
  );
}
