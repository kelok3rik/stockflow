// src/pages/roles/RolesFormModal.jsx
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, Switch, FormControlLabel
} from "@mui/material";
import { useEffect, useState } from "react";

export default function RolesFormModal({ open, onClose, data, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    activo: true
  });

  useEffect(() => {
    if (data) {
      setForm({
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo
      });
    } else {
      setForm({ nombre: "", descripcion: "", activo: true });
    }
  }, [data, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e) => {
    setForm(prev => ({ ...prev, activo: e.target.checked }));
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{data ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Nombre del rol"
          name="nombre"
          margin="dense"
          value={form.nombre}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Descripción"
          name="descripcion"
          margin="dense"
          value={form.descripcion}
          onChange={handleChange}
        />

        <FormControlLabel
          control={<Switch checked={form.activo} onChange={handleToggle} />}
          label="Activo"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {data ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
