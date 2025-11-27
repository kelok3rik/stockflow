import { Container, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3}>Bienvenido, {user?.nombre}</Typography>

      {user?.permisos?.inv_productos && (
        <Button variant="contained" sx={{ mr: 2 }}>Gestión de Productos</Button>
      )}
      {user?.permisos?.cxc_cobros && (
        <Button variant="contained" sx={{ mr: 2 }}>Cobros de Clientes</Button>
      )}
      {user?.permisos?.cxp_pagos && (
        <Button variant="contained" sx={{ mr: 2 }}>Pagos a Proveedores</Button>
      )}
      {/* Agregar más botones según permisos */}
    </Container>
  );
}
