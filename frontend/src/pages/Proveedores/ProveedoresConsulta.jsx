// src/pages/proveedores/ProveedoresConsulta.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProveedoresConsulta() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nombre: "",
    rnc: "",
    email: "",
    telefono: "",
    direccion: "",
    activo: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/proveedores`);
      setProveedores(res.data || []);
    } catch (error) {
      console.error("Error cargando proveedores", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  // Filtrado
  const proveedoresFiltrados = proveedores.filter((p) => {
    const nombreMatch = p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const rncMatch = p.rnc.toLowerCase().includes(filtros.rnc.toLowerCase());
    const emailMatch = p.email.toLowerCase().includes(filtros.email.toLowerCase());
    const telefonoMatch = p.telefono.toLowerCase().includes(filtros.telefono.toLowerCase());
    const direccionMatch = p.direccion.toLowerCase().includes(filtros.direccion.toLowerCase());
    const activoMatch =
      filtros.activo === ""
        ? true
        : filtros.activo === "true"
        ? p.activo === true
        : p.activo === false;

    return nombreMatch && rncMatch && emailMatch && telefonoMatch && direccionMatch && activoMatch;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Exportar Excel
  const exportExcel = () => {
    const exportData = proveedoresFiltrados.map((p) => ({
      Nombre: p.nombre,
      RNC: p.rnc,
      Email: p.email,
      Teléfono: p.telefono,
      Dirección: p.direccion,
      Activo: p.activo ? "Sí" : "No",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "proveedores.xlsx");
  };

  // Exportar PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Nombre", "RNC", "Email", "Teléfono", "Dirección", "Activo"];
    const tableRows = proveedoresFiltrados.map((p) => [
      p.nombre,
      p.rnc,
      p.email,
      p.telefono,
      p.direccion,
      p.activo ? "Sí" : "No",
    ]);
    doc.text("Listado de Proveedores", 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("proveedores.pdf");
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Proveedores
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
          label="Nombre"
          variant="outlined"
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="RNC"
          variant="outlined"
          value={filtros.rnc}
          onChange={(e) => setFiltros({ ...filtros, rnc: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Email"
          variant="outlined"
          value={filtros.email}
          onChange={(e) => setFiltros({ ...filtros, email: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Teléfono"
          variant="outlined"
          value={filtros.telefono}
          onChange={(e) => setFiltros({ ...filtros, telefono: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Dirección"
          variant="outlined"
          value={filtros.direccion}
          onChange={(e) => setFiltros({ ...filtros, direccion: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Activo</InputLabel>
          <Select
            label="Activo"
            value={filtros.activo}
            onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Sí</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tabla */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>RNC</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Activo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {proveedoresFiltrados.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                proveedoresFiltrados
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((p) => (
                    <TableRow key={p.id_proveedores}>
                      <TableCell>{p.id_proveedores}</TableCell>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{p.rnc}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.telefono}</TableCell>
                      <TableCell>{p.direccion}</TableCell>
                      <TableCell>{p.activo ? "Sí" : "No"}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Paginación */}
      <TablePagination
        component="div"
        count={proveedoresFiltrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
