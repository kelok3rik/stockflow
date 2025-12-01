// src/pages/almacenes/AlmacenesPage.jsx
import {
  Box, Button, Typography, TextField,
  TableContainer, Paper, Snackbar, Alert
} from "@mui/material";
import { useState } from "react";
import useAlmacenes from "./useAlmacenes";
import AlmacenesTable from "./AlmacenesTable";
import AlmacenFormModal from "./AlmacenesFormModal";

export default function AlmacenesPage() {

  const { almacenes, createAlmacen, updateAlmacen } = useAlmacenes();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false, msg: "", type: "success"
  });

  const lista = almacenes.filter(a =>
    a.codigo.toLowerCase().includes(search.toLowerCase()) ||
    a.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const save = async (data) => {
    try {
      edit
        ? await updateAlmacen(edit.id_almacen, data)
        : await createAlmacen(data);

      setSnackbar({
        open: true,
        type: "success",
        msg: edit ? "Almacén actualizado" : "Almacén creado"
      });

      setOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        type: "error",
        msg: "Error al guardar almacén"
      });
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Almacenes</Typography>
        <Button variant="contained" onClick={() => {
          setEdit(null);
          setOpen(true);
        }}>
          Nuevo Almacén
        </Button>
      </Box>

      <TextField
        label="Buscar por código o nombre"
        fullWidth size="small"
        sx={{ mb: 2 }}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <TableContainer component={Paper}>
        <AlmacenesTable
          almacenes={lista}
          onEdit={(a) => { setEdit(a); setOpen(true); }}
        />
      </TableContainer>

      <AlmacenFormModal
        open={open}
        almacen={edit}
        onClose={() => setOpen(false)}
        onSave={save}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
      </Snackbar>

    </Box>
  );
}
