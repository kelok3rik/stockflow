// src/pages/monedas/MonedaFormModal.jsx
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

export default function MonedaFormModal({ open, onClose, onSave, moneda }) {

  const emptyForm = {
    codigo: "",
    nombre: "",
    simbolo: "",
    tasa_cambio: "",
    es_base: false,
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
    if (moneda) {
      setForm({
        codigo: moneda.codigo || "",
        nombre: moneda.nombre || "",
        simbolo: moneda.simbolo || "",
        tasa_cambio: moneda.tasa_cambio ?? "",
        es_base: Boolean(moneda.es_base),
        activo: Boolean(moneda.activo),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, moneda]);

  // Validaciones
  const validate = () => {
    const e = {};

    if (!form.codigo) e.codigo = "Código obligatorio";
    if (form.codigo.length > 3) e.codigo = "Máximo 3 caracteres";

    if (!form.nombre) e.nombre = "Nombre obligatorio";

    if (!form.simbolo) e.simbolo = "Símbolo obligatorio";

    if (!form.tasa_cambio || isNaN(form.tasa_cambio))
      e.tasa_cambio = "Debe ser un número válido";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Guardar
  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({
        open: true,
        msg: "Corrige los campos del formulario",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      await onSave({
        codigo: form.codigo.toUpperCase(),
        nombre: form.nombre,
        simbolo: form.simbolo,
        tasa_cambio: Number(form.tasa_cambio),
        es_base: Boolean(form.es_base),
        activo: Boolean(form.activo),
      });

      setSnackbar({
        open: true,
        msg: moneda ? "Moneda actualizada" : "Moneda creada",
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
          {moneda ? "Editar" : "Nueva"} Moneda
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            <Grid item>
              <TextField
                label="Código ISO"
                name="codigo"
                size="small"
                fullWidth
                value={form.codigo}
                onChange={handleChange}
                error={!!errors.codigo}
                helperText={errors.codigo}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>

            <Grid item>
              <TextField
                label="Nombre"
                name="nombre"
                size="small"
                fullWidth
                value={form.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>

            <Grid item>
              <TextField
                label="Símbolo"
                name="simbolo"
                size="small"
                fullWidth
                value={form.simbolo}
                onChange={handleChange}
                error={!!errors.simbolo}
                helperText={errors.simbolo}
              />
            </Grid>

            <Grid item>
              <TextField
                label="Tasa de cambio"
                name="tasa_cambio"
                type="number"
                size="small"
                fullWidth
                value={form.tasa_cambio}
                onChange={handleChange}
                error={!!errors.tasa_cambio}
                helperText={errors.tasa_cambio}
              />
            </Grid>

            <Grid item>
              <TextField
                select
                size="small"
                fullWidth
                label="¿Es moneda base?"
                value={form.es_base ? "1" : "0"}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, es_base: e.target.value === "1" }))
                }
              >
                <MenuItem value="1">Sí</MenuItem>
                <MenuItem value="0">No</MenuItem>
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </>
  );
}
