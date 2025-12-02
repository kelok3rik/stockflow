// src/pages/empresas/EmpresasFormModal.jsx
import {
  Dialog, DialogTitle,
  DialogContent, DialogActions,
  TextField, Button,
  Grid, CircularProgress,
  Snackbar, Alert, MenuItem
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

const API_MONEDAS = `${import.meta.env.VITE_API_URL}/api/monedas`;

export default function EmpresasFormModal({ open, onClose, onSave, empresa }) {

  const emptyForm = {
    nombre: "",
    rnc: "",
    direccion: "",
    telefono: "",
    email: "",
    logo_url: "",
    moneda_base_id: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "success"
  });

  // cargar monedas
  useEffect(() => {
    axios.get(API_MONEDAS)
      .then(res => setMonedas(res.data || []))
      .catch(() => setMonedas([]));
  }, []);

  // cargar empresa para editar
  useEffect(() => {
    if (empresa) {
      setForm({
        nombre: empresa.nombre || "",
        rnc: empresa.rnc || "",
        direccion: empresa.direccion || "",
        telefono: empresa.telefono || "",
        email: empresa.email || "",
        logo_url: empresa.logo_url || "",
        moneda_base_id: empresa.moneda_base_id || ""
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, empresa]);

  // validación
  const validate = () => {
    const e = {};
    if (!form.nombre) e.nombre = "El nombre es obligatorio";
    if (!form.moneda_base_id) e.moneda_base_id = "Seleccione moneda base";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Correo inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({ open: true, msg: "Formulario inválido", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      await onSave(form);

      setSnackbar({
        open: true,
        msg: empresa ? "Empresa modificada" : "Empresa creada",
        severity: "success"
      });

      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        msg: error.response?.data?.error || "Error al guardar",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

        <DialogTitle>
          {empresa ? "Editar empresa" : "Nueva empresa"}
        </DialogTitle>

        <DialogContent dividers>

          <Grid container spacing={2} direction="column">

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
              <TextField label="RNC" name="rnc" size="small" fullWidth value={form.rnc} onChange={handleChange} />
            </Grid>

            <Grid item>
              <TextField label="Dirección" name="direccion" size="small" fullWidth value={form.direccion} onChange={handleChange} />
            </Grid>

            <Grid item>
              <TextField label="Teléfono" name="telefono" size="small" fullWidth value={form.telefono} onChange={handleChange} />
            </Grid>

            <Grid item>
              <TextField
                label="Correo"
                name="email"
                size="small"
                fullWidth
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            <Grid item>
              <TextField label="URL logo" name="logo_url" size="small" fullWidth value={form.logo_url} onChange={handleChange} />
            </Grid>

            <Grid item>
              <TextField
                select
                size="small"
                fullWidth
                label="Moneda base"
                name="moneda_base_id"
                value={form.moneda_base_id}
                onChange={handleChange}
                error={!!errors.moneda_base_id}
                helperText={errors.moneda_base_id}
              >
                {monedas.map(m => (
                  <MenuItem key={m.id_monedas} value={m.id_monedas}>
                    {m.codigo} - {m.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

          </Grid>

        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" disabled={loading} onClick={handleSave}>
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>

      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
