import {
  Button,
  Typography,
  Box,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";

import UbicacionesTable from "./UbicacionesTable";
import UbicacionFormModal from "./UbicacionesFormModal";
import useUbicaciones from "./useUbicaciones";
import axios from "axios";

export default function UbicacionesPage() {

  const API_URL = import.meta.env.VITE_API_URL;

  const { ubicaciones, createUbicacion, updateUbicacion } = useUbicaciones();
  const [almacenes, setAlmacenes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");

  // ✅ CARGAR ALMACENES
  useEffect(() => {
    axios.get(`${API_URL}/api/almacenes`)
      .then(res => setAlmacenes(res.data || []));
  }, []);

  // ✅ MAPA ID -> NOMBRE
  const almacenMap = almacenes.reduce((acc, a) => {
    acc[String(a.id_almacen)] = a.nombre;
    return acc;
  }, {});

  // ✅ NORMALIZAR DATOS
  const ubicacionesUI = (ubicaciones || []).map(u => ({
    ...u,
    almacen: almacenMap[u.id_almacen] || "Desconocido"
  }));

  // ✅ BUSCADOR
  const ubicacionesFiltradas = ubicacionesUI.filter(u => {
    const q = search.toLowerCase();
    return (
      u.codigo.toLowerCase().includes(q) ||
      u.nombre.toLowerCase().includes(q) ||
      u.almacen.toLowerCase().includes(q)
    );
  });

  const abrirNuevo = () => {
    setSelected(null);
    setOpen(true);
  };

  const editar = (u) => {
    setSelected(u);
    setOpen(true);
  };

  const guardar = async (data) => {
    if (selected) {
      await updateUbicacion(selected.id_ubicaciones, data);
    } else {
      await createUbicacion(data);
    }
  };

  return (
    <Box p={2}>

      <Typography variant="h5" mb={2}>
        Ubicaciones
      </Typography>

      {/* ✅ BARRA SUPERIOR */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Buscar por código, nombre o almacén..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={abrirNuevo}
          sx={{ whiteSpace: "nowrap" }}
        >
          Nueva Ubicación
        </Button>
      </Box>

      {/* ✅ TABLA */}
      <UbicacionesTable ubicaciones={ubicacionesFiltradas} onEdit={editar} />

      {/* ✅ MODAL */}
      <UbicacionFormModal
        open={open}
        onClose={() => setOpen(false)}
        ubicacion={selected}
        onSave={guardar}
      />
    </Box>
  );
}
