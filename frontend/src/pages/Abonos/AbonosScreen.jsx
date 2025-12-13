import React from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  CircularProgress
} from "@mui/material";
import { useAbonos } from "./useAbonos";

export default function AbonosScreen() {
  const {
    clientes,
    clienteSeleccionado,
    seleccionarCliente,
    facturas,
    loading,
    error,
    setAbonoFactura,
    abonarFactura
  } = useAbonos();

  return (
    <Box p={4}>
      <Typography variant="h5" mb={3}>
        Abonos a Facturas
      </Typography>

      {/* Seleccionar Cliente */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Cliente</InputLabel>
        <Select
          value={clienteSeleccionado?.id_clientes || ""}
          label="Cliente"
          onChange={e => seleccionarCliente(e.target.value)}
        >
          {Array.isArray(clientes) &&
            clientes.map(c => (
              <MenuItem key={c.id_clientes} value={c.id_clientes}>
                {c.nombre}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Tabla de Facturas */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : facturas.length === 0 ? (
        <Typography>No hay facturas pendientes para este cliente.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Saldo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Abonar</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map(f => (
              <TableRow key={f.id_facturas}>
                <TableCell>{f.numero_documento}</TableCell>
                <TableCell>{new Date(f.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{f.total.toFixed(2)}</TableCell>
                <TableCell>{f.saldo.toFixed(2)}</TableCell>
                <TableCell>{f.estado}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={f.abono}
                    onChange={e =>
                      setAbonoFactura(f.id_facturas, e.target.value)
                    }
                    inputProps={{ min: 0, max: f.saldo }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      abonarFactura(f, clienteSeleccionado?.nombre)
                    }
                  >
                    Abonar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
