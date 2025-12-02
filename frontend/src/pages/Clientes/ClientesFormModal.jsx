// src/pages/clientes/ClienteFormModal.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, CircularProgress,
  Snackbar, Alert, MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";

export default function ClienteFormModal({ open, onClose, onSave, data }) {

  const emptyForm = {
    nombre: "",
    doc_identidad: "",
    email: "",
    telefono: "",
    direccion: "",
    activo: true
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "success"
  });

  useEffect(() => {
    if (data) setForm(data);
    else setForm(emptyForm);
    setErrors({});
  }, [data, open]);

  const validate = () => {
    const e = {};
    if (!form.nombre) e.nombre = "Nombre obligatorio";
    if (!form.doc_identidad) e.doc_identidad = "Documento obligatorio";
    if (form.email && !form.email.includes("@")) e.email = "Correo inválido";
    if (!form.telefono) e.telefono = "Teléfono obligatorio";
    if (!form.direccion) e.direccion = "Dirección obligatoria";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({ open: true, msg: "Hay errores en el formulario", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      await onSave(form);
      setSnackbar({
        open: true,
        msg: data ? "Cliente actualizado" : "Cliente creado",
        severity: "success"
      });
      onClose();
    } catch {
      setSnackbar({ open: true, msg: "Error al guardar", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{data ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            <Grid item>
              <TextField label="Nombre" fullWidth name="nombre" value={form.nombre}
                onChange={handleChange} error={!!errors.nombre} helperText={errors.nombre} />
            </Grid>

            <Grid item>
              <TextField label="Documento" fullWidth name="doc_identidad" value={form.doc_identidad}
                onChange={handleChange} error={!!errors.doc_identidad} helperText={errors.doc_identidad} />
            </Grid>

            <Grid item>
              <TextField label="Email" fullWidth name="email" value={form.email}
                onChange={handleChange} error={!!errors.email} helperText={errors.email} />
            </Grid>

            <Grid item>
              <TextField label="Teléfono" fullWidth name="telefono" value={form.telefono}
                onChange={handleChange} error={!!errors.telefono} helperText={errors.telefono} />
            </Grid>

            <Grid item>
              <TextField label="Dirección" fullWidth name="direccion" value={form.direccion}
                onChange={handleChange} error={!!errors.direccion} helperText={errors.direccion} />
            </Grid>

            <Grid item>
              <TextField select label="Estado" fullWidth
                value={form.activo ? "1" : "0"}
                onChange={(e) => setForm({ ...form, activo: e.target.value === "1" })}
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
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </>
  );
}
