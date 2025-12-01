// src/pages/Departamentos/DepartamentosPage.jsx
import { useState } from "react";
import {
  Button,
  Typography,
  Box,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import DepartamentosTable from "./DepartamentosTable";
import DepartamentoFormModal from "./DepartamentosFormModal"; // ✅ corregido
import useDepartamentos from "./useDepartamentos";

export default function DepartamentosPage() {

  const {
    departamentos = [],
    createDepartamento,
    updateDepartamento,
    loading,
  } = useDepartamentos();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpen = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleEdit = (data) => {
    setEditData(data);
    setOpen(true);
  };

  const handleSubmit = async (form) => {
    try {
      if (editData) {
        await updateDepartamento(editData.id_departamentos, form);
        setSnackbar({ open: true, message: "Departamento actualizado", severity: "success" });
      } else {
        await createDepartamento(form);
        setSnackbar({ open: true, message: "Departamento creado", severity: "success" });
      }
      setOpen(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Error al guardar",
        severity: "error",
      });
    }
  };

  const filtrados = departamentos.filter(d =>
    d.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>

      <Typography variant="h5" mb={2}>
        Departamentos
      </Typography>

      {/* HEADER */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar departamento..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpen}>
          Nuevo
        </Button>
      </Box>

      {/* TABLA */}
      <DepartamentosTable
        departamentos={filtrados}
        onEdit={handleEdit}
      />

      {/* MODAL */}
      <DepartamentoFormModal
        open={open}
        onClose={handleClose}
        onSave={handleSubmit}
        departamento={editData}
        loading={loading}
      />

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
