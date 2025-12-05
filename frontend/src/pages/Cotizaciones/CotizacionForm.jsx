import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, IconButton,
  Box, Typography, Grid, Divider
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function CotizacionForm({ open, onClose, clientes, productos, onSubmit }) {
  const [cliente, setCliente] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [total, setTotal] = useState(0);

  // Recalcular total cada vez que detalle cambie
  useEffect(() => {
    const sum = detalle.reduce((acc, d) => acc + (d.cantidad * d.precio_unitario), 0);
    setTotal(sum);
  }, [detalle]);

  // Agregar fila vacía
  const addRow = () => setDetalle([...detalle, { producto: null, cantidad: 1, precio_unitario: 0 }]);

  // Actualizar fila
  const updateRow = (i, field, value) => {
    const copy = [...detalle];
    copy[i][field] = value;

    // Si se selecciona un producto, autocompletar precio
    if (field === "producto" && value) {
      copy[i].precio_unitario = value.precio_venta;
    }

    setDetalle(copy);
  };

  // Eliminar fila
  const removeRow = (i) => setDetalle(detalle.filter((_, index) => index !== i));

  // Enviar formulario
  const handleSubmit = () => {
    if (!cliente) {
      alert("Selecciona un cliente");
      return;
    }
    if (detalle.length === 0) {
      alert("Agrega al menos un producto");
      return;
    }

    const payload = {
      cliente_id: cliente.id_clientes,
      detalles: detalle.map(d => ({
        producto_id: d.producto.id_productos,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario
      })),
      total
    };

    onSubmit(payload);
    onClose();
    setCliente(null);
    setDetalle([]);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="lg">
      <DialogTitle>Crear Cotización</DialogTitle>
      <DialogContent>
        {/* Sección Cliente */}
        <Box mb={3}>
          <Autocomplete
            options={clientes}
            getOptionLabel={(option) => option.nombre}
            value={cliente}
            onChange={(_, newValue) => setCliente(newValue)}
            renderInput={(params) => <TextField {...params} label="Cliente" required fullWidth />}
          />
        </Box>

        {/* Sección Productos */}
        <Typography variant="subtitle1" fontWeight="bold">Productos</Typography>
        <Divider sx={{ mb: 2 }} />

        {detalle.map((row, i) => (
          <Grid container spacing={2} alignItems="center" key={i} sx={{ mb: 1 }}>
            {/* Producto */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={productos}
                getOptionLabel={(option) => `${option.nombre} (RD$ ${option.precio_venta})`}
                value={row.producto}
                onChange={(_, newValue) => updateRow(i, "producto", newValue)}
                renderInput={(params) => <TextField {...params} label="Producto" required size="small" fullWidth />}
              />
            </Grid>

            {/* Cantidad */}
            <Grid item xs={6} md={2}>
              <TextField
                type="number"
                label="Cantidad"
                size="small"
                value={row.cantidad}
                onChange={(e) => updateRow(i, "cantidad", Number(e.target.value))}
                fullWidth
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Precio Unitario */}
            <Grid item xs={6} md={2}>
              <TextField
                type="number"
                label="Precio Unitario"
                size="small"
                value={row.precio_unitario}
                onChange={(e) => updateRow(i, "precio_unitario", Number(e.target.value))}
                fullWidth
              />
            </Grid>

            {/* Subtotal */}
            <Grid item xs={6} md={1} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontWeight: "bold" }}>
                RD$ {(row.cantidad * row.precio_unitario).toFixed(2)}
              </Typography>
            </Grid>

            {/* Botón eliminar */}
            <Grid item xs={6} md={1} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconButton color="error" onClick={() => removeRow(i)}>
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button startIcon={<Add />} variant="outlined" onClick={addRow} sx={{ mb: 2 }}>
          Agregar Producto
        </Button>

        {/* Total */}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Typography variant="h6" fontWeight="bold">Total: RD$ {total.toFixed(2)}</Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
