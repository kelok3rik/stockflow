// src/pages/Monedas/MonedasPage.jsx
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import useMonedas from "./useMonedas";
import MonedasTable from "./MonedasTable";
import MonedaFormModal from "./MonedasFormModal";

export default function MonedasPage() {
  const { monedas, loading, createMoneda, updateMoneda, deleteMoneda } = useMonedas();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleOpen = (moneda = null) => {
    setSelected(moneda);
    setOpen(true);
  };

  const handleClose = () => {
    setSelected(null);
    setOpen(false);
  };

  const handleSave = async (data) => {
    if (selected) {
      await updateMoneda(selected.id_monedas, data);
    } else {
      await createMoneda(data);
    }
  };

  const filtered = monedas.filter(m =>
    m.codigo.toLowerCase().includes(search.toLowerCase()) ||
    m.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h5" mb={2}>Monedas</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar moneda..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={() => handleOpen()}>
          Nueva moneda
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <MonedasTable
          monedas={filtered}
          onEdit={handleOpen}
          onDelete={deleteMoneda}
        />
      )}

      <MonedaFormModal
        open={open}
        onClose={handleClose}
        moneda={selected}
        onSave={handleSave}
      />
    </Box>
  );
}
