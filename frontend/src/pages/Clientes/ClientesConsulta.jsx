// src/pages/clientes/ClientesConsulta.jsx
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

export default function ClientesConsulta() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nombre: "",
    doc_identidad: "",
    email: "",
    telefono: "",
    direccion: "",
    activo: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/clientes`);
      setClientes(res.data || []);
    } catch (error) {
      console.error("Error cargando clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  // Filtrado
  const clientesFiltrados = clientes.filter((c) => {
    const nombreMatch = c.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const docMatch = c.doc_identidad.toLowerCase().includes(filtros.doc_identidad.toLowerCase());
    const emailMatch = c.email.toLowerCase().includes(filtros.email.toLowerCase());
    const telefonoMatch = c.telefono.toLowerCase().includes(filtros.telefono.toLowerCase());
    const direccionMatch = c.direccion.toLowerCase().includes(filtros.direccion.toLowerCase());
    const activoMatch =
      filtros.activo === ""
        ? true
        : filtros.activo === "true"
        ? c.activo === true
        : c.activo === false;

    return nombreMatch && docMatch && emailMatch && telefonoMatch && direccionMatch && activoMatch;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Exportar Excel
  const exportExcel = () => {
    const exportData = clientesFiltrados.map((c) => ({
      Nombre: c.nombre,
      "Documento de Identidad": c.doc_identidad,
      Email: c.email,
      Teléfono: c.telefono,
      Dirección: c.direccion,
      Activo: c.activo ? "Sí" : "No",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "clientes.xlsx");
  };

  // Exportar PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Nombre", "Documento de Identidad", "Email", "Teléfono", "Dirección", "Activo"];
    const tableRows = clientesFiltrados.map((c) => [
      c.nombre,
      c.doc_identidad,
      c.email,
      c.telefono,
      c.direccion,
      c.activo ? "Sí" : "No",
    ]);
    doc.text("Listado de Clientes", 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("clientes.pdf");
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Clientes
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
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Documento de Identidad"
          value={filtros.doc_identidad}
          onChange={(e) => setFiltros({ ...filtros, doc_identidad: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Email"
          value={filtros.email}
          onChange={(e) => setFiltros({ ...filtros, email: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Teléfono"
          value={filtros.telefono}
          onChange={(e) => setFiltros({ ...filtros, telefono: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Dirección"
          value={filtros.direccion}
          onChange={(e) => setFiltros({ ...filtros, direccion: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Activo</InputLabel>
          <Select
            value={filtros.activo}
            onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
            label="Activo"
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
                <TableCell>Documento</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Activo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientesFiltrados.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                clientesFiltrados
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((c) => (
                    <TableRow key={c.id_clientes}>
                      <TableCell>{c.id_clientes}</TableCell>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell>{c.doc_identidad}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.telefono}</TableCell>
                      <TableCell>{c.direccion}</TableCell>
                      <TableCell>{c.activo ? "Sí" : "No"}</TableCell>
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
        count={clientesFiltrados.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
