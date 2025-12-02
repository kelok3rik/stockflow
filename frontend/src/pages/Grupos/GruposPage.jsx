import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Snackbar,
  Alert
} from "@mui/material";
import GruposTable from "./GruposTable";
import GrupoFormModal from "./GruposFormModal";
import useGrupos from "./useGrupos";

export default function GruposPage() {
  const { grupos, createGrupo, updateGrupo, loading } = useGrupos();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const handleOpen = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (data) => {
    setEditData(data);
    setOpen(true);
  };

  const handleSubmit = async (form) => {
    if (editData) {
      await updateGrupo(editData.id_grupos, form);
      setSnackbar({ open: true, message: "Grupo actualizado" });
    } else {
      await createGrupo(form);
      setSnackbar({ open: true, message: "Grupo creado" });
    }
    setOpen(false);
  };

  const filtrados = grupos.filter((g) =>
    g.nombre.toLowerCase().includes(search.toLowerCase()) ||
    g.departamento?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h5" mb={2}>Grupos</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar grupo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpen}>
          Nuevo
        </Button>
      </Box>

      <GruposTable grupos={filtrados} onEdit={handleEdit} />

      <GrupoFormModal
        open={open}
        onClose={() => setOpen(false)}
        loading={loading}
        data={editData}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
