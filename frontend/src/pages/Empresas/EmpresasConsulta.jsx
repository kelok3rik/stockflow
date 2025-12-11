// src/pages/empresas/EmpresaConsulta.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  useMediaQuery,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

export default function EmpresaConsulta() {
  const [empresas, setEmpresas] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    nombre: "",
    rnc: "",
    direccion: "",
    telefono: "",
    email: "",
    moneda: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery("(max-width:900px)");

  const loadData = async () => {
    try {
      setLoading(true);
      const [resEmpresas, resMonedas] = await Promise.all([
        axios.get(`${API_URL}/api/empresas`),
        axios.get(`${API_URL}/api/monedas`),
      ]);
      setEmpresas(resEmpresas.data || []);
      setMonedas(resMonedas.data || []);
    } catch (error) {
      console.error("Error cargando empresas o monedas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const dataFiltrada = empresas.filter((d) => {
    const moneda = monedas.find((m) => String(m.id_monedas) === String(d.moneda_base_id));
    return (
      (filtros.nombre === "" || d.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
      (filtros.rnc === "" || d.rnc.includes(filtros.rnc)) &&
      (filtros.direccion === "" || d.direccion.toLowerCase().includes(filtros.direccion.toLowerCase())) &&
      (filtros.telefono === "" || d.telefono.includes(filtros.telefono)) &&
      (filtros.email === "" || d.email.toLowerCase().includes(filtros.email.toLowerCase())) &&
      (filtros.moneda === "" || (moneda && String(moneda.id_monedas) === String(filtros.moneda)))
    );
  });

  // EXPORTAR A EXCEL
  const exportExcel = () => {
    const exportData = dataFiltrada.map((d) => {
      const moneda = monedas.find((m) => String(m.id_monedas) === String(d.moneda_base_id));
      return {
        Nombre: d.nombre,
        RNC: d.rnc,
        Dirección: d.direccion,
        Teléfono: d.telefono,
        Email: d.email,
        "Moneda Base": moneda ? `${moneda.nombre} (${moneda.codigo})` : "",
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empresas");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "empresas.xlsx");
  };

  // EXPORTAR A PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Nombre", "RNC", "Dirección", "Teléfono", "Email", "Moneda Base"];
    const tableRows = [];

    dataFiltrada.forEach((d) => {
      const moneda = monedas.find((m) => String(m.id_monedas) === String(d.moneda_base_id));
      const row = [
        d.nombre,
        d.rnc,
        d.direccion,
        d.telefono,
        d.email,
        moneda ? `${moneda.nombre} (${moneda.codigo})` : "",
      ];
      tableRows.push(row);
    });

    doc.text("Listado de Empresas", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("empresas.pdf");
  };

  return (
    <Box sx={{ p: 2, maxWidth: "100%", mx: "auto" }}>
      <Typography variant="h5" mb={2}>
        Consulta de Empresas
      </Typography>

      {/* Botones Exportar */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Button variant="contained" color="primary" onClick={exportExcel}>
          Exportar Excel
        </Button>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Exportar PDF
        </Button>
      </Box>

      {/* Filtros */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        <TextField
          label="Nombre"
          value={filtros.nombre}
          onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="RNC"
          value={filtros.rnc}
          onChange={(e) => setFiltros({ ...filtros, rnc: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Dirección"
          value={filtros.direccion}
          onChange={(e) => setFiltros({ ...filtros, direccion: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Teléfono"
          value={filtros.telefono}
          onChange={(e) => setFiltros({ ...filtros, telefono: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Email"
          value={filtros.email}
          onChange={(e) => setFiltros({ ...filtros, email: e.target.value })}
          sx={{ minWidth: 150 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Moneda Base</InputLabel>
          <Select
            value={filtros.moneda}
            onChange={(e) => setFiltros({ ...filtros, moneda: e.target.value })}
            label="Moneda Base"
          >
            <MenuItem value="">Todas</MenuItem>
            {monedas.map((m) => (
              <MenuItem key={m.id_monedas} value={m.id_monedas}>
                {m.nombre} ({m.codigo})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabla */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: isMobile ? 400 : 600 }}>
          <Table stickyHeader size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>RNC</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Moneda Base</TableCell>
                <TableCell>Logo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataFiltrada.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron registros
                  </TableCell>
                </TableRow>
              ) : (
                dataFiltrada
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((d) => {
                    const moneda = monedas.find(
                      (m) => String(m.id_monedas) === String(d.moneda_base_id)
                    );
                    return (
                      <TableRow key={d.id_empresa}>
                        <TableCell>{d.nombre}</TableCell>
                        <TableCell>{d.rnc}</TableCell>
                        <TableCell>{d.direccion}</TableCell>
                        <TableCell>{d.telefono}</TableCell>
                        <TableCell>{d.email}</TableCell>
                        <TableCell>
                          {moneda ? `${moneda.nombre} (${moneda.codigo})` : ""}
                        </TableCell>
                        <TableCell>
                          {d.logo_url && (
                            <img src={d.logo_url} alt={d.nombre} style={{ height: 30 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={dataFiltrada.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
