import { Typography, Box } from "@mui/material";

export default function Productos() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Productos
      </Typography>
      <Typography>
        Aquí podrás ver, crear, editar y eliminar productos del inventario.
      </Typography>
      {/* Aquí luego puedes agregar tu tabla de productos, filtros, botones, etc. */}
    </Box>
  );
}
