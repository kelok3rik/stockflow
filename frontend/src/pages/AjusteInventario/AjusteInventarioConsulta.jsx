// frontend/src/pages/AjusteInventario/AjusteInventarioConsulta.jsx

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
  Chip
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

import { generarExcel, generarPDF } from "../../utils/exportHelper";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function MovimientosInventario() {
  const { user } = useAuth();
  const usuarioActual = user?.nombre || "Usuario";

  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    tipo: "",
    usuario: "",
    fecha: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openRows, setOpenRows] = useState({});

  // =============================
  // Cargar movimientos
  // =============================
  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/movimientos-inventario`
      );
      setMovimientos(res.data || []);
    } catch (error) {
      console.error("Error cargando movimientos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovimientos();
  }, []);

  // =============================
  // Filtros frontend
  // =============================
  const movimientosFiltrados = movimientos.filter((m) => {
    const tipoMatch =
      filtros.tipo === "" || m.tipo_movimiento === filtros.tipo;

    const usuarioMatch =
      filtros.usuario === "" || m.usuario === filtros.usuario;

    const fechaMatch =
      filtros.fecha === "" ||
      new Date(m.fecha).toLocaleDateString() ===
        new Date(filtros.fecha).toLocaleDateString();

    return tipoMatch && usuarioMatch && fechaMatch;
  });

  // =============================
  // Exportación
  // =============================
  const columnas = [
    { header: "Documento", field: "numero_documento" },
    { header: "Fecha", field: "fecha" },
    { header: "Tipo", field: "tipo_movimiento" },
    { header: "Usuario", field: "usuario" },
    { header: "Referencia", field: "referencia" },
  ];

  const filtrosTexto = `Tipo: ${
    filtros.tipo || "Todos"
  } | Usuario: ${filtros.usuario || "Todos"} | Fecha: ${
    filtros.fecha || "Todas"
  }`;

  const exportExcel = () => {
    generarExcel(
      "movimientos_inventario",
      movimientosFiltrados,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  const exportPDF = () => {
    generarPDF(
      "MOVIMIENTOS DE INVENTARIO",
      "movimientos_inventario",
      movimientosFiltrados,
      columnas,
      usuarioActual,
      filtrosTexto
    );
  };

  // =============================
  // Paginación
  // =============================
  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Movimientos de Inventario
      </Typography>

      {/* Exportación */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={exportExcel}>
          Exportar Excel
        </Button>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Exportar PDF
        </Button>
      </Box>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filtros.tipo}
            label="Tipo"
            onChange={(e) =>
              setFiltros({ ...filtros, tipo: e.target.value })
            }
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="ENTRADA">ENTRADA</MenuItem>
            <MenuItem value="SALIDA">SALIDA</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Usuario"
          value={filtros.usuario}
          onChange={(e) =>
            setFiltros({ ...filtros, usuario: e.target.value })
          }
        />

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
              <TableCell />
              <TableCell>Documento</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Referencia</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {movimientosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay movimientos
                </TableCell>
              </TableRow>
            ) : (
              movimientosFiltrados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((m) => (
                  <React.Fragment key={m.id_movimientos_inventario}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setOpenRows((prev) => ({
                              ...prev,
                              [m.id_movimientos_inventario]:
                                !prev[m.id_movimientos_inventario],
                            }))
                          }
                        >
                          {openRows[m.id_movimientos_inventario] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell>{m.numero_documento}</TableCell>
                      <TableCell>
                        {new Date(m.fecha).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.tipo_movimiento}
                          color={
                            m.tipo_movimiento === "ENTRADA"
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{m.usuario}</TableCell>
                      <TableCell>{m.referencia || "-"}</TableCell>
                    </TableRow>

                    {/* Detalle */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse
                          in={openRows[m.id_movimientos_inventario]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ m: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Detalle del movimiento
                            </Typography>

                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Producto</TableCell>
                                  <TableCell align="right">
                                    Cantidad
                                  </TableCell>
                                  <TableCell>Tipo</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {m.detalles.map((d, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{d.producto}</TableCell>
                                    <TableCell align="right">
                                      {Math.abs(d.cantidad)}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={d.tipo}
                                        color={
                                          d.tipo === "ENTRADA"
                                            ? "success"
                                            : "error"
                                        }
                                        size="small"
                                      />
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
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={movimientosFiltrados.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
