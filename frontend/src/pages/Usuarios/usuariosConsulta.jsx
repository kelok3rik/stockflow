import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TablePagination,
  Button,
} from "@mui/material";

import { generarExcel, generarPDF } from "../../utils/exportHelper";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsuariosConsulta() {
  const { user } = useAuth();
  const usuarioActual = user?.nombre || user?.usuario || "Usuario desconocido";

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    nombre: "",
    usuario: "",
    activo: "",
    rol: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/usuarios/query`);
      setUsuarios(res.data || []);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/roles`);
      setRoles(res.data || []);
    } catch (error) {
      console.error("Error cargando roles", error);
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, []);

  const usuariosFiltrados = usuarios.filter((u) => {
    const nombreMatch = u.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const usuarioMatch = u.usuario.toLowerCase().includes(filtros.usuario.toLowerCase());

    const activoMatch =
      filtros.activo === ""
        ? true
        : filtros.activo === "true"
        ? u.activo === true
        : u.activo === false;

    const rolMatch = filtros.rol === "" ? true : u.rol === filtros.rol;

    return nombreMatch && usuarioMatch && activoMatch && rolMatch;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columnas = [
    { header: "Nombre", field: "nombre" },
    { header: "Usuario", field: "usuario" },
    { header: "Clave", field: "clave" },
    { header: "Rol", field: "rol" },
    { header: "Activo", field: "activoTexto" },
  ];

  const datosParaExportar = usuariosFiltrados.map((u) => ({
    ...u,
    activoTexto: u.activo ? "Sí" : "No",
  }));

  const filtrosTexto = `
Nombre: ${filtros.nombre || "Todos"} | 
Usuario: ${filtros.usuario || "Todos"} | 
Activo: ${filtros.activo === "" ? "Todos" : filtros.activo === "true" ? "Activo" : "Inactivo"} | 
Rol: ${filtros.rol || "Todos"}
`.replace(/\s+/g, " ");

  const exportExcel = () => {
    generarExcel("usuarios", datosParaExportar, columnas, usuarioActual, filtrosTexto);
  };

  const exportPDF = () => {
    generarPDF("REPORTE DE USUARIOS", "usuarios", datosParaExportar, columnas, usuarioActual, filtrosTexto);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Usuarios
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" color="primary" onClick={exportExcel}>
          Exportar Excel
        </Button>

        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Exportar PDF
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Nombre"
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          sx={{ minWidth: 200 }}
        />

        <TextField
          label="Usuario"
          value={filtros.usuario}
          onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
          sx={{ minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Activo</InputLabel>
          <Select
            value={filtros.activo}
            label="Activo"
            onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Rol</InputLabel>
          <Select
            value={filtros.rol}
            label="Rol"
            onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r.id_roles} value={r.nombre}>
                {r.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Clave</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Activo</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {usuariosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              usuariosFiltrados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <TableRow key={u.id_usuarios}>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.usuario}</TableCell>
                    <TableCell>{u.clave}</TableCell>
                    <TableCell>{u.rol}</TableCell>
                    <TableCell>{u.activo ? "Sí" : "No"}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={usuariosFiltrados.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
