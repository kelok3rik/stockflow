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

export default function PagosConsulta() {
  const { user } = useAuth();
  const usuarioActual = user?.nombre || user?.usuario || "Usuario desconocido";

  const [pagos, setPagos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    proveedor: "",
    fecha: "",
    numeroCompra: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar pagos
  const loadPagos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/pagos`);
      setPagos(res.data || []);
    } catch (error) {
      console.error("Error cargando pagos", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proveedores
  const loadProveedores = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/proveedores`);
      setProveedores(res.data || []);
    } catch (error) {
      console.error("Error cargando proveedores", error);
    }
  };

  useEffect(() => {
    loadPagos();
    loadProveedores();
  }, []);

  // Filtrado en frontend
  const pagosFiltrados = pagos.filter((p) => {
    const proveedorMatch =
      filtros.proveedor === "" || p.proveedor_id === filtros.proveedor;
    const fechaMatch =
      filtros.fecha === "" ||
      new Date(p.fecha).toLocaleDateString() ===
        new Date(filtros.fecha).toLocaleDateString();
    const compraMatch =
      filtros.numeroCompra === "" ||
      p.numero_compra.includes(filtros.numeroCompra);

    return proveedorMatch && fechaMatch && compraMatch;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columnas = [
    { header: "Número de pago", field: "numero_documento" },
    { header: "Proveedor", field: "proveedor_nombre" },
    { header: "Número compra", field: "numero_compra" },
    { header: "Fecha", field: "fecha" },
    { header: "Monto", field: "monto" },
    { header: "Método pago", field: "metodo_pago" },
  ];

  // Texto de filtros aplicados
  const filtrosTexto = `Proveedor: ${
    filtros.proveedor
      ? proveedores.find((p) => p.id_proveedores === filtros.proveedor)?.nombre
      : "Todos"
  } | Fecha: ${filtros.fecha || "Todos"} | Número compra: ${
    filtros.numeroCompra || "Todos"
  }`;

  const exportExcel = () => {
    generarExcel(
      "pagos",
      pagosFiltrados,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  const exportPDF = () => {
    generarPDF(
      "REPORTE DE PAGOS",
      "pagos",
      pagosFiltrados,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Pagos
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
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Proveedor</InputLabel>
          <Select
            value={filtros.proveedor}
            label="Proveedor"
            onChange={(e) =>
              setFiltros({ ...filtros, proveedor: e.target.value })
            }
          >
            <MenuItem value="">Todos</MenuItem>
            {proveedores.map((p) => (
              <MenuItem key={p.id_proveedores} value={p.id_proveedores}>
                {p.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Fecha"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filtros.fecha}
          onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="Número de compra"
          value={filtros.numeroCompra}
          onChange={(e) =>
            setFiltros({ ...filtros, numeroCompra: e.target.value })
          }
          sx={{ minWidth: 150 }}
        />
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
              {columnas.map((col) => (
                <TableCell key={col.field}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas.length} align="center">
                  No se encontraron pagos
                </TableCell>
              </TableRow>
            ) : (
              pagosFiltrados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((p) => (
                  <TableRow key={p.id_pagos}>
                    <TableCell>{p.numero_documento}</TableCell>
                    <TableCell>{p.proveedor_nombre}</TableCell>
                    <TableCell>{p.numero_compra}</TableCell>
                    <TableCell>
                      {new Date(p.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${Number(p.monto).toFixed(2)}</TableCell>
                    <TableCell>{p.metodo_pago}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={pagosFiltrados.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
