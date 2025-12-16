// frontend/src/pages/Compras/ComprasConsulta.jsx

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
  Button,
  Collapse,
  IconButton,
  TablePagination
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { generarExcel, generarPDF } from "../../utils/exportHelper";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function ComprasConsulta() {
  const { user } = useAuth();
  const usuarioActual = user?.nombre || "Usuario";

  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    proveedor: "",
    estado: "",
    fecha: ""
  });

  const [openRows, setOpenRows] = useState({});

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadCompras = async () => {
    setLoading(true);
    const res = await axios.get(`${API_URL}/api/compras`);
    setCompras(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCompras();
  }, []);

  useEffect(() => {
    const uniqueProveedores = [
      ...new Set(compras.map((c) => c.proveedor_nombre))
    ].map((nombre, index) => ({
      id: index,
      nombre
    }));
    setProveedores(uniqueProveedores);
  }, [compras]);

  const comprasFiltradas = compras.filter((c) => {
    const proveedorMatch =
      filtros.proveedor === "" || c.proveedor_nombre === filtros.proveedor;

    const estadoMatch =
      filtros.estado === "" || c.estado === filtros.estado;

    const fechaMatch =
      filtros.fecha === "" ||
      new Date(c.fecha).toLocaleDateString() ===
        new Date(filtros.fecha).toLocaleDateString();

    return proveedorMatch && estadoMatch && fechaMatch;
  });

  const columnas = [
    { header: "# Compra", field: "numero_documento" },
    { header: "Proveedor", field: "proveedor_nombre" },
    { header: "Fecha", field: "fecha" },
    { header: "Estado", field: "estado" },
    { header: "Total", field: "total" }
  ];

  const filtrosTexto = `
Proveedor: ${filtros.proveedor || "Todos"} |
Estado: ${filtros.estado || "Todos"} |
Fecha: ${filtros.fecha || "Todas"}
`;

  const exportExcel = () =>
    generarExcel(
      "compras",
      comprasFiltradas,
      columnas,
      usuarioActual,
      filtrosTexto
    );

  const exportPDF = () =>
    generarPDF(
      "REPORTE DE COMPRAS",
      "compras",
      comprasFiltradas,
      columnas,
      usuarioActual,
      filtrosTexto
    );

  const comprasPaginadas = comprasFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Compras
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={exportExcel}>
          Exportar Excel
        </Button>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Exportar PDF
        </Button>
      </Box>

      {/* FILTROS */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
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
              <MenuItem key={p.id} value={p.nombre}>
                {p.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filtros.estado}
            label="Estado"
            onChange={(e) =>
              setFiltros({ ...filtros, estado: e.target.value })
            }
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
            <MenuItem value="PAGADA">Pagada</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Fecha"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filtros.fecha}
          onChange={(e) =>
            setFiltros({ ...filtros, fecha: e.target.value })
          }
        />
      </Box>

      {loading && <CircularProgress />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell># Compra</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comprasPaginadas.map((c) => (
              <React.Fragment key={c.id_compras}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setOpenRows((p) => ({
                          ...p,
                          [c.id_compras]: !p[c.id_compras]
                        }))
                      }
                    >
                      {openRows[c.id_compras] ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>{c.numero_documento}</TableCell>
                  <TableCell>{c.proveedor_nombre}</TableCell>
                  <TableCell>
                    {new Date(c.fecha).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{c.estado}</TableCell>
                  <TableCell>
                    RD$ {Number(c.total).toFixed(2)}
                  </TableCell>
                </TableRow>

                {/* DETALLE */}
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <Collapse in={openRows[c.id_compras]}>
                      <Box sx={{ m: 2 }}>
                        <Typography variant="subtitle1">
                          Detalle de la compra
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Producto</TableCell>
                              <TableCell align="right">Cantidad</TableCell>
                              <TableCell align="right">Costo</TableCell>
                              <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {c.detalles.map((d) => (
                              <TableRow key={d.id_compra_detalle}>
                                <TableCell>{d.producto}</TableCell>
                                <TableCell align="right">
                                  {d.cantidad}
                                </TableCell>
                                <TableCell align="right">
                                  RD$ {Number(d.costo_unitario).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                  RD$ {Number(d.subtotal).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={comprasFiltradas.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
}
