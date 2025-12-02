import { useState } from "react";
import {
  Box, Button, Typography, TextField,
  Snackbar, Alert
} from "@mui/material";
import TiposMovimientoTable from "./TiposMovimientosTable";
import TipoMovimientoFormModal from "./TiposMovimientosFormModal";
import useTiposMovimiento from "./useTiposMovimientos";

export default function TiposMovimientoPage() {
  const { tiposMovimiento, createTipo, updateTipo, loading } = useTiposMovimiento();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, msg: "" });

  const handleOpen = () => { setEditData(null); setOpen(true); };
  const handleEdit = (row) => { setEditData(row); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleSubmit = async (form) => {
    if (editData) {
      await updateTipo(editData.id_tipos_movimiento, form);
      setSnackbar({ open: true, msg: "Tipo actualizado" });
    } else {
      await createTipo(form);
      setSnackbar({ open: true, msg: "Tipo creado" });
    }
    setOpen(false);
  };

  const filtrados = tiposMovimiento.filter(t =>
    t.nombre.toLowerCase().includes(search.toLowerCase())
    || t.clase.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>

      <Typography variant="h5" mb={2}>Tipos de Movimiento</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar..."
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpen}>
          Nuevo
        </Button>
      </Box>

      <TiposMovimientoTable
        data={filtrados}
        onEdit={handleEdit}
      />

      <TipoMovimientoFormModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        data={editData}
        loading={loading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity="success">{snackbar.msg}</Alert>
      </Snackbar>

    </Box>
  );
}
