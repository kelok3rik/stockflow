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

export default function CobrosConsulta() {
  const { user } = useAuth();
  const usuarioActual = user?.nombre || user?.usuario || "Usuario desconocido";

  const [cobros, setCobros] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    cliente: "",
    fecha: "",
    numeroFactura: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar cobros
  const loadCobros = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/cobros`);
      setCobros(res.data || []);
    } catch (error) {
      console.error("Error cargando cobros", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes
  const loadClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/clientes`);
      setClientes(res.data || []);
    } catch (error) {
      console.error("Error cargando clientes", error);
    }
  };

  useEffect(() => {
    loadCobros();
    loadClientes();
  }, []);

  // Filtrado en frontend
  const cobrosFiltrados = cobros.filter((c) => {
    const clienteMatch =
      filtros.cliente === "" || c.cliente_id === filtros.cliente;
    const fechaMatch =
      filtros.fecha === "" ||
      new Date(c.fecha).toLocaleDateString() ===
        new Date(filtros.fecha).toLocaleDateString();
    const facturaMatch =
      filtros.numeroFactura === "" ||
      c.numero_factura.includes(filtros.numeroFactura);

    return clienteMatch && fechaMatch && facturaMatch;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columnas = [
    { header: "Número de cobro", field: "numero_documento" },
    { header: "Cliente", field: "cliente_nombre" },
    { header: "Número factura", field: "numero_factura" },
    { header: "Fecha", field: "fecha" },
    { header: "Monto", field: "monto" },
    { header: "Método cobro", field: "metodo_pago" },
  ];

  // Texto de filtros aplicados
  const filtrosTexto = `Cliente: ${
    filtros.cliente
      ? clientes.find((cl) => cl.id_clientes === filtros.cliente)?.nombre
      : "Todos"
  } | Fecha: ${filtros.fecha || "Todos"} | Número factura: ${
    filtros.numeroFactura || "Todos"
  }`;

  const exportExcel = () => {
    generarExcel(
      "cobros",
      cobrosFiltrados,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  const exportPDF = () => {
    generarPDF(
      "REPORTE DE COBROS",
      "cobros",
      cobrosFiltrados,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Cobros
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
          <InputLabel>Cliente</InputLabel>
          <Select
            value={filtros.cliente}
            label="Cliente"
            onChange={(e) =>
              setFiltros({ ...filtros, cliente: e.target.value })
            }
          >
            <MenuItem value="">Todos</MenuItem>
            {clientes.map((cl) => (
              <MenuItem key={cl.id_clientes} value={cl.id_clientes}>
                {cl.nombre}
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
          label="Número de factura"
          value={filtros.numeroFactura}
          onChange={(e) =>
            setFiltros({ ...filtros, numeroFactura: e.target.value })
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
            {cobrosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas.length} align="center">
                  No se encontraron cobros
                </TableCell>
              </TableRow>
            ) : (
              cobrosFiltrados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((c) => (
                  <TableRow key={c.id_cobros}>
                    <TableCell>{c.numero_documento}</TableCell>
                    <TableCell>{c.cliente_nombre}</TableCell>
                    <TableCell>{c.numero_factura}</TableCell>
                    <TableCell>
                      {new Date(c.fecha).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${Number(c.monto).toFixed(2)}</TableCell>
                    <TableCell>{c.metodo_pago}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={cobrosFiltrados.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
