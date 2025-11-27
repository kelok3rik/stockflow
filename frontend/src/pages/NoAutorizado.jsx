import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NoAutorizado() {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h3" gutterBottom>
        ❌ Acceso Denegado
      </Typography>
      <Typography variant="h6" gutterBottom>
        No tienes permiso para acceder a esta sección.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Volver al Dashboard
      </Button>
    </Box>
  );
}
