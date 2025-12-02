// src/pages/proveedores/ProveedoresPage.jsx
import { useState } from "react";
import { Button, Typography, Box, TextField, Snackbar, Alert } from "@mui/material";
import ProveedoresTable from "./ProveedoresTable";
import ProveedorFormModal from "./ProveedoresFormModal";
import useProveedores from "./useProveedores";

export default function ProveedoresPage() {
  const { proveedores, createProveedor, updateProveedor, loading } = useProveedores();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

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
    if (editData) {
      await updateProveedor(editData.id_proveedores, form);
      setSnackbar({ open: true, message: "Proveedor actualizado" });
    } else {
      await createProveedor(form);
      setSnackbar({ open: true, message: "Proveedor creado" });
    }
    setOpen(false);
  };

  const filtrados = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h5" mb={2}>Proveedores</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar proveedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpen}>Nuevo</Button>
      </Box>

      <ProveedoresTable proveedores={filtrados} onEdit={handleEdit} />

      <ProveedorFormModal
        open={open}
        onClose={handleClose}
        onSave={handleSubmit}
        data={editData}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
