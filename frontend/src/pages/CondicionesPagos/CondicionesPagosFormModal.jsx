import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem,
  Snackbar, Alert, CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";

export default function CondicionesPagoFormModal({ open, onClose, onSave, condicion }) {

  const emptyForm = {
    nombre: "",
    dias_plazo: "",
    activo: true
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    if (condicion) {
      setForm({
        nombre: condicion.nombre || "",
        dias_plazo: condicion.dias_plazo ?? "",
        activo: condicion.activo ?? true
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, condicion]);

  const validate = () => {
    const e = {};
    if (!form.nombre) e.nombre = "Requerido";
    if (!form.dias_plazo) e.dias_plazo = "Requerido";
    if (form.dias_plazo < 0) e.dias_plazo = "No puede ser negativo";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({ open: true, msg: "Corrige los errores", severity: "error" });
      return;
    }
    try {
      setLoading(true);
      await onSave({
        nombre: form.nombre,
        dias_plazo: Number(form.dias_plazo),
        activo: Boolean(form.activo)
      });
      setSnackbar({
        open: true,
        msg: condicion ? "Actualizado correctamente" : "Creado correctamente",
        severity: "success"
      });
      onClose();
    } catch (err) {
      setSnackbar({
        open: true,
        msg: err.response?.data?.error || "Error al guardar",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{condicion ? "Editar" : "Nueva"} Condición de Pago</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            <Grid item>
              <TextField
                label="Nombre"
                size="small"
                fullWidth
                name="nombre"
                value={form.nombre}
                onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>

            <Grid item>
              <TextField
                type="number"
                label="Días de crédito"
                size="small"
                fullWidth
                value={form.dias_plazo}
                onChange={e => setForm(prev => ({ ...prev, dias_plazo: e.target.value }))}
                error={!!errors.dias_plazo}
                helperText={errors.dias_plazo}
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
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </>
  );
}
