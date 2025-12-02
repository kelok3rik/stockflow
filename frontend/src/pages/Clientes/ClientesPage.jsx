// src/pages/clientes/ClientesPage.jsx
import { useState } from "react";
import {
  Button, Typography, Box,
  TextField, CircularProgress
} from "@mui/material";
import ClientesTable from "./ClientesTable";
import ClienteFormModal from "./ClientesFormModal";
import useClientes from "./useClientes";

export default function ClientesPage() {

  const { clientes, createCliente, updateCliente, loading } = useClientes();

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.doc_identidad.includes(search)
  );

  const handleOpen = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditData(row);
    setOpen(true);
  };

  const handleSubmit = async (form) => {
    if (editData)
      await updateCliente(editData.id_clientes, form);
    else
      await createCliente(form);
  };

  return (
    <Box>

      <Typography variant="h5" mb={2}>Clientes</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpen}>Nuevo</Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <ClientesTable clientes={filtered} onEdit={handleEdit} />
      )}

      <ClienteFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSubmit}
        data={editData}
      />

    </Box>
  );
}
