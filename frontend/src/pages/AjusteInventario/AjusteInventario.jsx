import {
  Box, Grid, TextField, Button, Typography, MenuItem,
  Table, TableHead, TableBody, TableCell, TableRow, Paper, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import useAjusteInventario from "./useAjusteInventario";

export default function AjusteInventario() {
  const {
    productos,
    detalles,
    tipoMovimiento,
    referencia,
    loading,

    setTipoMovimiento,
    setReferencia,

    agregarDetalle,
    modificarDetalle,
    eliminarDetalle,
    registrarAjuste
  } = useAjusteInventario();

  const handleGuardar = async () => {
    const usuario_id = 1; // <-- luego lo sacas del auth

    const res = await registrarAjuste(usuario_id);
    if (res?.error) {
      alert(res.error);
    } else {
      alert("Ajuste registrado correctamente");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ajuste de Inventario
      </Typography>

      {/* ================= ENCABEZADO ================= */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Tipo de Ajuste"
              fullWidth
              value={tipoMovimiento}
              onChange={e => setTipoMovimiento(e.target.value)}
            >
              <MenuItem value="1">Entrada</MenuItem>
              <MenuItem value="2">Salida</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              label="Referencia / Observación"
              fullWidth
              value={referencia}
              onChange={e => setReferencia(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ================= DETALLES ================= */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Button variant="outlined" onClick={agregarDetalle}>
          + Agregar Producto
        </Button>

        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell align="center">Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(detalles || []).map((d, index) => (
              <TableRow key={index}>
                <TableCell width="60%">
                  <TextField
                    select
                    fullWidth
                    value={d.producto_id}
                    onChange={e =>
                      modificarDetalle(index, "producto_id", e.target.value)
                    }
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {productos.map(p => (
                      <MenuItem key={p.id_productos} value={p.id_productos}>
                        {p.nombre} (Stock: {p.stock})
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell width="25%">
                  <TextField
                    type="number"
                    fullWidth
                    value={d.cantidad}
                    onChange={e =>
                      modificarDetalle(index, "cantidad", e.target.value)
                    }
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton color="error" onClick={() => eliminarDetalle(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* ================= BOTÓN FINAL ================= */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleGuardar}
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar Ajuste"}
      </Button>
    </Box>
  );
}
