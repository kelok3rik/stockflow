import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem
} from "@mui/material";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function GrupoFormModal({ open, onClose, onSubmit, data, loading }) {
  const [form, setForm] = useState({ nombre: "", departamento_id: "", activo: true });
  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    if (open) loadDepartamentos();
  }, [open]);

  useEffect(() => {
    if (data) setForm(data);
    else setForm({ nombre: "", departamento_id: "", activo: true });
  }, [data]);

  const loadDepartamentos = async () => {
    const { data } = await axios.get(`${API_URL}/api/departamentos`);
    setDepartamentos(data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        bgcolor: "background.paper",
        p: 3,
        width: 400,
        mx: "auto",
        mt: "10%",
        borderRadius: 2
      }}>
        <Typography variant="h6" mb={2}>
          {data ? "Editar Grupo" : "Nuevo Grupo"}
        </Typography>

        <TextField
          label="Nombre"
          name="nombre"
          fullWidth
          margin="dense"
          value={form.nombre}
          onChange={handleChange}
        />

        <TextField
          select
          label="Departamento"
          name="departamento_id"
          fullWidth
          margin="dense"
          value={form.departamento_id}
          onChange={handleChange}
        >
          {departamentos.map((d) => (
            <MenuItem key={d.id_departamentos} value={d.id_departamentos}>
              {d.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Activo"
          name="activo"
          fullWidth
          margin="dense"
          value={form.activo}
          onChange={handleChange}
        >
          <MenuItem value={true}>Activo</MenuItem>
          <MenuItem value={false}>Inactivo</MenuItem>
        </TextField>

        <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
