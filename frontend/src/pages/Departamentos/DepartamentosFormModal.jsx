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

export default function DepartamentoFormModal({ open, onClose, onSave, departamento }) {

  const emptyForm = {
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

  // Cargar datos al editar
  useEffect(() => {
    if (departamento) {
      setForm({
        nombre: departamento.nombre || "",
        activo: departamento.activo ?? true,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, departamento]);

  // Validaciones
  const validate = () => {
    const e = {};

    if (!form.nombre) e.nombre = "Nombre obligatorio";
    if (form.nombre.length > 80) e.nombre = "Máximo 80 caracteres";

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
        nombre: form.nombre,
        activo: Boolean(form.activo),
      });

      setSnackbar({
        open: true,
        msg: departamento ? "Departamento modificado" : "Departamento creado",
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
          {departamento ? "Editar" : "Nuevo"} Departamento
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

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
                inputProps={{ maxLength: 80 }}
              />
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
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>

      </Dialog>

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
