// src/pages/usuarios/UsuariosPage.jsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  TablePagination
} from "@mui/material";
import axios from "axios";
import UsuariosTable from "./UsuariosTable";
import UsuarioFormModal from "./UsuariosFormModal";
import useUsuarios from "./useUsuarios";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsuariosPage() {
  const { usuarios, createUsuario, updateUsuario } = useUsuarios();
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = () => { setEditData(null); setOpen(true); };
  const handleClose = () => setOpen(false);
  const handleEdit = (data) => { setEditData(data); setOpen(true); };

  const handleSubmit = async (form) => {
    if (editData) {
      await updateUsuario(editData.id_usuarios, form);
      setSnackbar({ open: true, message: "Usuario actualizado" });
    } else {
      await createUsuario(form);
      setSnackbar({ open: true, message: "Usuario creado" });
    }
    setOpen(false);
  };

  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Datos paginados
  const paginados = filtrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/roles`);
        setRoles(res.data || []);
      } catch (error) {
        console.error("Error cargando roles", error);
      }
    };
    loadRoles();
  }, []);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Usuarios</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={handleOpen}>Nuevo</Button>
      </Box>

      <UsuariosTable usuarios={paginados} onEdit={handleEdit} roles={roles} />

      <TablePagination
        component="div"
        count={filtrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <UsuarioFormModal
        open={open}
        onClose={handleClose}
        onSave={handleSubmit}
        data={editData}
        roles={roles}
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
