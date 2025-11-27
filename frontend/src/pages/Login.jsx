import { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../api/auth';

export default function Login() {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await loginAPI(usuario, clave);
      login(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Error de login');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 12,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h5" mb={3}>Iniciar Sesión!</Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Usuario"
            fullWidth
            margin="normal"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
          />
          <TextField
            label="Clave"
            type="password"
            fullWidth
            margin="normal"
            value={clave}
            onChange={e => setClave(e.target.value)}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>Ingresar</Button>
        </form>
      </Box>
    </Container>
  );
}
