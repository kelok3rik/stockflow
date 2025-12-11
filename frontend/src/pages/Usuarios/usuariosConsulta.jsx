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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsuariosConsulta() {
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

  // Cargar usuarios
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

  // Cargar roles
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

  // Filtrado
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

  // EXPORTAR EXCEL
  const exportExcel = () => {
    const exportData = usuariosFiltrados.map((u) => ({
      Nombre: u.nombre,
      Usuario: u.usuario,
      Clave: u.clave,
      Rol: u.rol,
      Activo: u.activo ? "Sí" : "No",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "usuarios.xlsx");
  };

  // EXPORTAR PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Nombre", "Usuario", "Clave", "Rol", "Activo"];
    const tableRows = usuariosFiltrados.map((u) => [
      u.nombre,
      u.usuario,
      u.clave,
      u.rol,
      u.activo ? "Sí" : "No",
    ]);

    doc.text("Listado de Usuarios", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("usuarios.pdf");
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Usuarios
      </Typography>

      {/* Botones Exportar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary" onClick={exportExcel}>
          Exportar Excel
        </Button>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Exportar PDF
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Buscar por nombre"
          variant="outlined"
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          sx={{ minWidth: 200 }}
        />

        <TextField
          label="Buscar por usuario"
          variant="outlined"
          value={filtros.usuario}
          onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
          sx={{ minWidth: 200 }}
        />

        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Activo</InputLabel>
          <Select
            label="Activo"
            value={filtros.activo}
            onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Rol</InputLabel>
          <Select
            label="Rol"
            value={filtros.rol}
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

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Clave</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Activo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuariosFiltrados.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              usuariosFiltrados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((u) => (
                  <TableRow key={u.id_usuarios}>
                    <TableCell>{u.id_usuarios}</TableCell>
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

      {/* Paginación */}
      <TablePagination
        component="div"
        count={usuariosFiltrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
