import {
  Box, Grid, TextField, Button, Typography, MenuItem,
  Table, TableHead, TableBody, TableCell, TableRow, Paper, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import useDevolucionFactura from "./useDevoluciones";

export default function DevolucionFactura() {
  const {
    facturas,
    detalles,
    selectedFactura,
    loading,
    setSelectedFactura,
    cargarDetallesFactura,
    modificarDetalle,
    registrarDevolucion
  } = useDevolucionFactura();

  const handleFacturaChange = (e) => {
    const facturaId = Number(e.target.value);
    setSelectedFactura(facturaId);
    if (facturaId) cargarDetallesFactura(facturaId);
  };

  const handleGuardar = async () => {
    const usuario_id = 1; // luego obtener del auth
    const usuario_nombre = "Erik Cruz"; // luego del auth
    const res = await registrarDevolucion(usuario_id, usuario_nombre);
    if (res?.error) {
      alert(res.error);
    } else {
      alert("Devolución registrada correctamente");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Devolución de Factura
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Seleccionar Factura"
              fullWidth
              value={selectedFactura || ""}
              onChange={handleFacturaChange}
            >
              <MenuItem value="">Seleccione</MenuItem>
              {facturas.map(f => (
                <MenuItem key={f.id_facturas} value={f.id_facturas}>
                  {f.numero_documento} - {f.cliente}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {detalles.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Cantidad Facturada</TableCell>
                <TableCell>Cantidad a Devolver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalles.map((d, index) => (
                <TableRow key={index}>
                  <TableCell>{d.producto}</TableCell>
                  <TableCell>{d.cantidad}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      fullWidth
                      inputProps={{ min: 0, max: d.cantidad }}
                      value={d.cantidad_devuelta}
                      onChange={e => modificarDetalle(index, e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleGuardar}
        disabled={loading || detalles.length === 0}
      >
        {loading ? "Procesando..." : "Registrar Devolución"}
      </Button>
    </Box>
  );
}
