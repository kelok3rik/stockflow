import { useState } from "react";
import { Box, Button, Typography, Paper, Divider } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import useCotizacion from "./useCotizacion";
import CotizacionTable from "./CotizacionTable";
import CotizacionForm from "./CotizacionForm";

export default function CotizacionPage() {
  const { cotizaciones, clientes, productos, createCotizacion, deleteCotizacion } = useCotizacion();
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Cotizaciones
      </Typography>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Lista de Cotizaciones</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Nueva Cotización
        </Button>
      </Paper>

      <CotizacionTable data={cotizaciones} onDelete={deleteCotizacion} />

      <CotizacionForm
        open={open}
        onClose={() => setOpen(false)}
        clientes={clientes}
        productos={productos}
        onSubmit={createCotizacion}
      />
    </Box>
  );
}
