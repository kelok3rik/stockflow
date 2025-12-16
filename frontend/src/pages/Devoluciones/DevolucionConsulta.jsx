import React, { useEffect, useState } from "react";
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
  Button,
  Collapse,
  IconButton,
  TablePagination
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { generarExcel, generarPDF } from "../../utils/exportHelper";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function DevolucionConsulta() {
  const { user } = useAuth();
  const usuarioActual = user?.nombre || "Usuario";

  const [devoluciones, setDevoluciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    factura: "",
    fecha: ""
  });

  const [openRows, setOpenRows] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadDevoluciones = async () => {
    setLoading(true);
    const res = await axios.get(`${API_URL}/api/devoluciones`);
    setDevoluciones(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadDevoluciones();
  }, []);

  const devolucionesFiltradas = devoluciones.filter((d) => {
    const facturaMatch =
      filtros.factura === "" || d.factura_id === filtros.factura;

    const fechaMatch =
      filtros.fecha === "" ||
      new Date(d.fecha).toLocaleDateString() ===
        new Date(filtros.fecha).toLocaleDateString();

    return facturaMatch && fechaMatch;
  });

  const columnas = [
    { header: "N° Dev", field: "numero_documento" },
    { header: "Factura", field: "factura_id" },
    { header: "Fecha", field: "fecha" },
    { header: "Usuario", field: "usuario" },
    { header: "Total", field: "total" }
  ];

  const filtrosTexto = `Factura: ${filtros.factura || "Todas"} | Fecha: ${
    filtros.fecha || "Todas"
  }`;

  const exportExcel = () =>
    generarExcel(
      "devoluciones",
      devolucionesFiltradas,
      columnas,
      usuarioActual,
      filtrosTexto
    );

  const exportPDF = () =>
    generarPDF(
      "REPORTE DE DEVOLUCIONES",
      "devoluciones",
      devolucionesFiltradas,
      columnas,
      usuarioActual,
      filtrosTexto
    );

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const devolucionesPaginadas = devolucionesFiltradas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
      <Typography variant="h4" mb={3}>
        Consulta de Devoluciones
      </Typography>

      {/* BOTONES */}
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
        <TextField
          label="Factura"
          value={filtros.factura}
          onChange={(e) =>
            setFiltros({ ...filtros, factura: e.target.value })
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

      {loading && <CircularProgress />}

      {/* TABLA */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>N° Dev</TableCell>
              <TableCell>Factura</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {devolucionesPaginadas.map((d) => (
              <React.Fragment key={d.id_devoluciones}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setOpenRows((p) => ({
                          ...p,
                          [d.id_devoluciones]: !p[d.id_devoluciones]
                        }))
                      }
                    >
                      {openRows[d.id_devoluciones] ? (
                        <KeyboardArrowUp />
                      ) : (
                        <KeyboardArrowDown />
                      )}
                    </IconButton>
                  </TableCell>

                  <TableCell>{d.numero_documento}</TableCell>
                  <TableCell>{d.factura_id}</TableCell>
                  <TableCell>
                    {new Date(d.fecha).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{d.usuario}</TableCell>
                  <TableCell align="right">
                    RD$ {Number(d.total).toFixed(2)}
                  </TableCell>
                </TableRow>

                {/* DETALLE */}
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <Collapse in={openRows[d.id_devoluciones]}>
                      <Box sx={{ m: 2 }}>
                        <Typography variant="subtitle1">
                          Detalle de la devolución
                        </Typography>

                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Producto</TableCell>
                              <TableCell align="right">Cantidad</TableCell>
                              <TableCell align="right">Precio</TableCell>
                              <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {d.detalles.map((det) => (
                              <TableRow key={det.detalle_id}>
                                <TableCell>{det.producto}</TableCell>
                                <TableCell align="right">
                                  {det.cantidad}
                                </TableCell>
                                <TableCell align="right">
                                  RD$ {Number(det.precio_unitario).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                  RD$ {Number(det.subtotal).toFixed(2)}
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
          count={devolucionesFiltradas.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
}
