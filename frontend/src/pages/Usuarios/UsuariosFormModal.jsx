// src/pages/usuarios/UsuarioFormModal.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, CircularProgress,
  MenuItem, Snackbar, Alert
} from "@mui/material";
import { useState, useEffect } from "react";

export default function UsuarioFormModal({ open, onClose, onSave, data, roles = [] }) {
  const emptyForm = {
    nombre: "",
    usuario: "",
    clave: "",
    id_rol: "",
    activo: "1" // usar string "1" o "0" para el select
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        id_rol: data.id_rol.toString(),
        activo: data.activo ? "1" : "0"
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [data, open]);

  const validate = () => {
    const e = {};
    if (!form.nombre) e.nombre = "Nombre obligatorio";
    if (!form.usuario) e.usuario = "Usuario obligatorio";
    if (!form.clave) e.clave = "Clave obligatoria";
    if (!form.id_rol) e.id_rol = "Rol obligatorio";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({ open: true, msg: "Hay errores en el formulario", severity: "error" });
      return;
    }

    const payload = {
      ...form,
      id_rol: form.id_rol, // string o number según tu backend
      activo: form.activo === "1" // convertir a booleano
    };

    try {
      setLoading(true);
      await onSave(payload);
      setSnackbar({
        open: true,
        msg: data ? "Usuario actualizado" : "Usuario creado",
        severity: "success"
      });
      onClose();
    } catch {
      setSnackbar({ open: true, msg: "Error al guardar", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{data ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            <Grid item>
              <TextField
                label="Nombre"
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
                label="Usuario"
                fullWidth
                name="usuario"
                value={form.usuario}
                onChange={handleChange}
                error={!!errors.usuario}
                helperText={errors.usuario}
              />
            </Grid>

            <Grid item>
              <TextField
                label="Clave"
                fullWidth
                name="clave"
                value={form.clave}
                onChange={handleChange}
                error={!!errors.clave}
                helperText={errors.clave}
              />
            </Grid>

            <Grid item>
              <TextField
                select
                label="Rol"
                fullWidth
                name="id_rol"
                value={form.id_rol}
                onChange={handleChange}
                error={!!errors.id_rol}
                helperText={errors.id_rol}
              >
                {roles.map(r => (
                  <MenuItem key={r.id_roles} value={r.id_roles.toString()}>
                    {r.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item>
              <TextField
                select
                label="Activo"
                fullWidth
                name="activo"
                value={form.activo}
                onChange={handleChange}
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
