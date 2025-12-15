// frontend/src/pages/Factura/FacturaConsulta.jsx
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
  Collapse,
  IconButton,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

import { generarExcel, generarPDF } from "../../utils/exportHelper";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function FacturasConsulta() {
  const { user } = useAuth();
  const usuarioActual = user?.nombre || user?.usuario || "Usuario desconocido";

  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    cliente: "",
    fecha: "",
    estado: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openRows, setOpenRows] = useState({}); // control de filas expandidas

  // Cargar facturas
  const loadFacturas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/facturas`);
      setFacturas(res.data || []);
    } catch (error) {
      console.error("Error cargando facturas", error);
    } finally {
      setLoading(false);
    }
  };

  // Extraer clientes únicos
  const loadClientes = () => {
    const uniqueClientes = [
      ...new Set(facturas.map((f) => f.cliente))
    ].map((nombre, index) => ({ id_clientes: index, nombre }));
    setClientes(uniqueClientes);
  };

  useEffect(() => {
    loadFacturas();
  }, []);

  useEffect(() => {
    loadClientes();
  }, [facturas]);

  // Filtrado en frontend
  const facturasFiltradas = facturas.filter((f) => {
    const clienteMatch =
      filtros.cliente === "" || f.cliente === filtros.cliente;
    const fechaMatch =
      filtros.fecha === "" ||
      new Date(f.fecha).toLocaleDateString() ===
        new Date(filtros.fecha).toLocaleDateString();
    const estadoMatch =
      filtros.estado === "" || f.estado === filtros.estado;

    return clienteMatch && fechaMatch && estadoMatch;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columnas = [
    { header: "Número de factura", field: "id_facturas" },
    { header: "Cliente", field: "cliente" },
    { header: "Fecha", field: "fecha" },
    { header: "Total", field: "total" },
    { header: "Saldo", field: "saldo" },
    { header: "Estado", field: "estado" },
  ];

  const filtrosTexto = `Cliente: ${
    filtros.cliente || "Todos"
  } | Fecha: ${filtros.fecha || "Todos"} | Estado: ${filtros.estado || "Todos"}`;

  const exportExcel = () => {
    generarExcel(
      "facturas",
      facturasFiltradas,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  const exportPDF = () => {
    generarPDF(
      "REPORTE DE FACTURAS",
      "facturas",
      facturasFiltradas,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Facturas
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
              <MenuItem key={cl.id_clientes} value={cl.nombre}>
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

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filtros.estado}
            label="Estado"
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="PAGADA">PAGADA</MenuItem>
            <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
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
              <TableCell />
              {columnas.map((col) => (
                <TableCell key={col.field}>{col.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {facturasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas.length + 1} align="center">
                  No se encontraron facturas
                </TableCell>
              </TableRow>
            ) : (
              facturasFiltradas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((f) => (
                  <React.Fragment key={f.id_facturas}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenRows((prev) => ({
                              ...prev,
                              [f.id_facturas]: !prev[f.id_facturas],
                            }))
                          }
                        >
                          {openRows[f.id_facturas] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{f.id_facturas}</TableCell>
                      <TableCell>{f.cliente}</TableCell>
                      <TableCell>
                        {new Date(f.fecha).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${Number(f.total).toFixed(2)}</TableCell>
                      <TableCell>${Number(f.saldo).toFixed(2)}</TableCell>
                      <TableCell>{f.estado}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={columnas.length + 1}
                      >
                        <Collapse
                          in={openRows[f.id_facturas]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box margin={1}>
                            <Typography
                              variant="subtitle1"
                              gutterBottom
                              component="div"
                            >
                              Detalles de la factura
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Producto</TableCell>
                                  <TableCell>Cantidad</TableCell>
                                  <TableCell>Precio Unitario</TableCell>
                                  <TableCell>Subtotal</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {f.detalles.map((d) => (
                                  <TableRow key={d.id_factura_detalle}>
                                    <TableCell>{d.producto}</TableCell>
                                    <TableCell>{d.cantidad}</TableCell>
                                    <TableCell>${d.precio_unitario}</TableCell>
                                    <TableCell>${d.subtotal}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={facturasFiltradas.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
