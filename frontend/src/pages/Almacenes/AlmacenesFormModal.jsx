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

export default function AlmacenFormModal({ open, onClose, onSave, almacen }) {

  const emptyForm = {
    codigo: "",
    nombre: "",
    activo: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Cargar almacen cuando se edita
  useEffect(() => {
    if (almacen) {
      setForm({
        codigo: almacen.codigo || "",
        nombre: almacen.nombre || "",
        activo: almacen.activo ?? true,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [almacen, open]);

  // Validaciones
  const validate = () => {
    const e = {};

    if (!form.codigo) e.codigo = "Código obligatorio";
    if (form.codigo.length > 40) e.codigo = "Máximo 40 caracteres";

    if (!form.nombre) e.nombre = "Nombre obligatorio";
    if (form.nombre.length > 120) e.nombre = "Máximo 120 caracteres";

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
        activo: Boolean(form.activo),
      });

      setSnackbar({
        open: true,
        msg: almacen ? "Almacén actualizado" : "Almacén creado",
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
        <DialogTitle>{almacen ? "Editar" : "Nuevo"} Almacén</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            {/* CÓDIGO */}
            <Grid item>
              <TextField
                fullWidth
                size="small"
                label="Código"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                error={!!errors.codigo}
                helperText={errors.codigo}
              />
            </Grid>

            {/* NOMBRE */}
            <Grid item>
              <TextField
                fullWidth
                size="small"
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>

            {/* ESTADO */}
            <Grid item>
              <TextField
                select
                size="small"
                fullWidth
                label="Estado"
                value={form.activo ? "1" : "0"}
                onChange={(e) =>
                  setForm(p => ({ ...p, activo: e.target.value === "1" }))
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
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
