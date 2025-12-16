import { Container, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" mb={3}>Bienvenido, {user?.nombre}</Typography>
    </Container>
  );
}
