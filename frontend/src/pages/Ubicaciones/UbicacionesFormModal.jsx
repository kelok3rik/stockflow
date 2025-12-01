import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UbicacionFormModal({ open, onClose, onSave, ubicacion }) {

  const API_URL = import.meta.env.VITE_API_URL;

  const emptyForm = {
    codigo: "",
    nombre: "",
    id_almacen: "",
    activo: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [almacenes, setAlmacenes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Cargar almacenes
  useEffect(() => {
    if (!open) return;
    axios.get(`${API_URL}/api/almacenes`)
      .then(res => setAlmacenes(res.data || []));
  }, [open]);

  // Cargar datos al editar
  useEffect(() => {
    if (ubicacion) {
      setForm({
        codigo: ubicacion.codigo || "",
        nombre: ubicacion.nombre || "",
        id_almacen: String(ubicacion.id_almacen || ""),
        activo: ubicacion.activo ?? true,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, ubicacion]);

  // Validaciones
  const validate = () => {
    const e = {};

    if (!form.codigo) e.codigo = "Código obligatorio";
    if (form.codigo.length > 40) e.codigo = "Máximo 40 caracteres";

    if (!form.nombre) e.nombre = "Nombre obligatorio";
    if (form.nombre.length > 120) e.nombre = "Máximo 120 caracteres";

    if (!form.id_almacen) e.id_almacen = "Debe seleccionar un almacén";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Guardar
  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({
        open: true,
        msg: "Revisa los errores del formulario",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      await onSave({
        ...form,
        id_almacen: Number(form.id_almacen),
        activo: Boolean(form.activo),
      });

      setSnackbar({
        open: true,
        msg: ubicacion ? "Ubicación modificada" : "Ubicación creada",
        severity: "success",
      });

      onClose();
    } catch (err) {
      setSnackbar({
        open: true,
        msg: err.response?.data?.error || "Error al guardar",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

        <DialogTitle>
          {ubicacion ? "Editar" : "Nueva"} Ubicación
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            <Grid item>
              <TextField
                label="Código"
                size="small"
                fullWidth
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                error={!!errors.codigo}
                helperText={errors.codigo}
              />
            </Grid>

            <Grid item>
              <TextField
                label="Nombre"
                size="small"
                fullWidth
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>

            <Grid item>
              <TextField
                select
                fullWidth
                size="small"
                label="Almacén"
                name="id_almacen"
                value={form.id_almacen}
                onChange={handleChange}
                error={!!errors.id_almacen}
                helperText={errors.id_almacen}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {almacenes.map(a => (
                  <MenuItem key={a.id_almacen} value={String(a.id_almacen)}>
                    {a.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item>
              <TextField
                select
                size="small"
                fullWidth
                label="Estado"
                value={form.activo ? "1" : "0"}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, activo: e.target.value === "1" }))
                }
              >
                <MenuItem value="1">Activo</MenuItem>
                <MenuItem value="0">Inactivo</MenuItem>
              </TextField>
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>

    </>
  );
}
