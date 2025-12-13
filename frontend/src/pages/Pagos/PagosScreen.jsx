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
import { usePagos } from "./usePagos";

export default function PagosScreen() {
  const {
    proveedores,
    proveedorSeleccionado,
    seleccionarProveedor,
    compras,
    loading,
    error,
    setAbonoCompra,
    pagarCompra
  } = usePagos();

  return (
    <Box p={4}>
      <Typography variant="h5" mb={3}>
        Pagos a Compras
      </Typography>

      {/* Seleccionar Proveedor */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Proveedor</InputLabel>
        <Select
          value={proveedorSeleccionado || ""}
          label="Proveedor"
          onChange={e => seleccionarProveedor(e.target.value)}
        >
          {Array.isArray(proveedores) &&
            proveedores.map(p => (
              <MenuItem key={p.id_proveedores} value={p.id_proveedores}>
                {p.nombre}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Tabla de Compras */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : compras.length === 0 ? (
        <Typography>No hay compras pendientes para este proveedor.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Saldo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Pagar</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compras.map(c => (
              <TableRow key={c.id_compras}>
                <TableCell>{c.numero_documento}</TableCell>
                <TableCell>{c.fecha}</TableCell>
                <TableCell>{c.total.toFixed(2)}</TableCell>
                <TableCell>{c.saldo.toFixed(2)}</TableCell>
                <TableCell>{c.estado}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={c.abono}
                    onChange={e => setAbonoCompra(c.id_compras, e.target.value)}
                    inputProps={{ min: 0, max: c.saldo }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => pagarCompra(c)}
                  >
                    Pagar
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
