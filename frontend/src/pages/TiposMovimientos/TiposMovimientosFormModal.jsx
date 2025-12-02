import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Grid,
  CircularProgress, Snackbar, Alert
} from "@mui/material";
import { useEffect, useState } from "react";

export default function TipoMovimientoFormModal({ open, onClose, onSubmit, data, loading }) {

  const emptyForm = {
    nombre: "",
    clase: "",
    descripcion: "",
    activo: true
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    if (data) {
      setForm({
        nombre: data.nombre || "",
        clase: data.clase || "",
        descripcion: data.descripcion || "",
        activo: data.activo ?? true
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, data]);

  const validate = () => {
    const e = {};

    if (!form.nombre) e.nombre = "Nombre obligatorio";
    if (form.nombre.length > 80) e.nombre = "Máximo 80 caracteres";
    if (!form.clase) e.clase = "Seleccione clase";
    if (["ENTRADA", "SALIDA"].indexOf(form.clase) === -1)
      e.clase = "Debe ser ENTRADA o SALIDA";
    if (form.descripcion.length > 255)
      e.descripcion = "Máximo 255 caracteres";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({ open: true, msg: "Errores en formulario", severity: "error" });
      return;
    }

    await onSubmit({
      ...form,
      activo: Boolean(form.activo)
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

        <DialogTitle>
          {data ? "Editar" : "Nuevo"} Tipo de Movimiento
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            <Grid item>
              <TextField
                label="Nombre"
                size="small"
                fullWidth
                value={form.nombre}
                error={!!errors.nombre}
                helperText={errors.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
            </Grid>

            <Grid item>
              <TextField
                select
                label="Clase"
                fullWidth
                size="small"
                value={form.clase}
                error={!!errors.clase}
                helperText={errors.clase}
                onChange={e => setForm({ ...form, clase: e.target.value })}
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="ENTRADA">ENTRADA</MenuItem>
                <MenuItem value="SALIDA">SALIDA</MenuItem>
              </TextField>
            </Grid>

            <Grid item>
              <TextField
                label="Descripción"
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={form.descripcion}
                error={!!errors.descripcion}
                helperText={errors.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
              />
            </Grid>

            <Grid item>
              <TextField
                select
                fullWidth
                size="small"
                label="Estado"
                value={form.activo ? "1" : "0"}
                onChange={e => setForm({ ...form, activo: e.target.value === "1" })}
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
