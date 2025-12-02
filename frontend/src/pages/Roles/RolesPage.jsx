// src/pages/roles/RolesPage.jsx
import { useState } from "react";
import { Box, Typography, Button, TextField, CircularProgress, Snackbar, Alert } from "@mui/material";
import useRoles from "./useRoles";
import RolesTable from "./RolesTable";
import RolesFormModal from "./RolesFormModal";

export default function RolesPage() {
  const { roles, loading, createRol, updateRol, deleteRol } = useRoles();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleOpen = (rol = null) => {
    setSelectedRol(rol);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedRol(null);
    setOpen(false);
  };

  const handleSave = async (form) => {
    try {
      if (selectedRol) {
        await updateRol(selectedRol.id_roles, form);
        setSnackbar({ open: true, message: "Rol actualizado", severity: "success" });
      } else {
        await createRol(form);
        setSnackbar({ open: true, message: "Rol creado", severity: "success" });
      }
      handleClose();
    } catch (error) {
      setSnackbar({ open: true, message: "Error al guardar", severity: "error" });
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Roles</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={() => handleOpen()}>
          Nuevo Rol
        </Button>
      </Box>

      {loading ? <CircularProgress /> :
        <RolesTable
          roles={roles}
          search={search}
          onEdit={handleOpen}
          onDelete={deleteRol}
        />
      }

      <RolesFormModal
        open={open}
        data={selectedRol}
        onClose={handleClose}
        onSave={handleSave}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
