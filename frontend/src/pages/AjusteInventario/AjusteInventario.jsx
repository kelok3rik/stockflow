// frontend/src/pages/Inventario/AjusteInventario.jsx
import { useState } from "react";
import {
  Box, Grid, TextField, Button, Typography, MenuItem,
  Table, TableHead, TableBody, TableCell, TableRow, Paper, Badge
} from "@mui/material";
import useAjusteInventario from "./useAjusteInventario";

export default function AjusteInventario() {
  const { productos, movimientos, loading, registrarMovimiento } = useAjusteInventario();

  const [productoId, setProductoId] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [observacion, setObservacion] = useState("");

  const handleRegistrar = async () => {
    const result = await registrarMovimiento({
      producto_id: productoId,
      tipo: tipoMovimiento,
      cantidad,
      observacion
    });

    if (result.error) {
      alert(result.error);
    } else {
      setProductoId("");
      setTipoMovimiento("");
      setCantidad("");
      setObservacion("");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ajuste de Inventario
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Producto"
              fullWidth
              value={productoId}
              onChange={e => setProductoId(e.target.value)}
            >
              <MenuItem value="" disabled>Seleccione un producto</MenuItem>
              {productos.map(p => (
                <MenuItem key={p.id_productos} value={p.id_productos}>
                  {p.nombre} &nbsp;
                  <Badge color={p.stock <= p.stock_min ? "error" : "primary"} badgeContent={p.stock}>
                    Stock
                  </Badge>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Tipo de movimiento"
              fullWidth
              value={tipoMovimiento}
              onChange={e => setTipoMovimiento(e.target.value)}
            >
              <MenuItem value="" disabled>Seleccione tipo</MenuItem>
              <MenuItem value="entrada">Entrada</MenuItem>
              <MenuItem value="salida">Salida</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              label="Cantidad"
              type="number"
              fullWidth
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Observación"
              fullWidth
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleRegistrar} disabled={loading}>
              {loading ? "Guardando..." : "Registrar Movimiento"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Movimientos recientes
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientos.map((m, i) => (
              <TableRow key={i}>
                <TableCell>{m.producto_nombre}</TableCell>
                <TableCell sx={{ color: m.tipo === "entrada" ? "green" : "red" }}>
                  {m.tipo}
                </TableCell>
                <TableCell>{m.cantidad}</TableCell>
                <TableCell>{m.observacion}</TableCell>
                <TableCell>{m.fecha}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
