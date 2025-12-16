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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { generarExcel, generarPDF } from "../../utils/exportHelper";
import { generarDocumentoPDF } from "../../utils/generarFactura";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function CotizacionesConsulta() {
    const { user } = useAuth();
    const usuarioActual = user?.nombre || "Usuario";

    const [cotizaciones, setCotizaciones] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [condicionesPago, setCondicionesPago] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filtros, setFiltros] = useState({ cliente: "", fecha: "" });
    const [openRows, setOpenRows] = useState({});
    const [openConvertir, setOpenConvertir] = useState(false);
    const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
    const [condicionId, setCondicionId] = useState("");
    const [montoRecibido, setMontoRecibido] = useState("");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadCotizaciones = async () => {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/cotizaciones`);
        setCotizaciones(res.data || []);
        setLoading(false);
    };

    const loadCondicionesPago = async () => {
        const res = await axios.get(`${API_URL}/api/condiciones-pago`);
        setCondicionesPago(res.data || []);
    };

    useEffect(() => {
        loadCotizaciones();
        loadCondicionesPago();
    }, []);

    useEffect(() => {
        const uniqueClientes = [...new Set(cotizaciones.map((c) => c.cliente))].map((nombre, index) => ({
            id: index,
            nombre
        }));
        setClientes(uniqueClientes);
    }, [cotizaciones]);

    const cotizacionesFiltradas = cotizaciones.filter((c) => {
        const clienteMatch = filtros.cliente === "" || c.cliente === filtros.cliente;
        const fechaMatch =
            filtros.fecha === "" ||
            new Date(c.fecha).toLocaleDateString() ===
            new Date(filtros.fecha).toLocaleDateString();
        return clienteMatch && fechaMatch;
    });

    const columnas = [
        { header: "ID", field: "id_cotizaciones" },
        { header: "Cliente", field: "cliente" },
        { header: "Fecha", field: "fecha" },
        { header: "Total", field: "total" },
    ];

    const filtrosTexto = `Cliente: ${filtros.cliente || "Todos"} | Fecha: ${filtros.fecha || "Todas"}`;

    const exportExcel = () =>
        generarExcel("cotizaciones", cotizacionesFiltradas, columnas, usuarioActual, filtrosTexto);

    const exportPDF = () =>
        generarPDF("REPORTE DE COTIZACIONES", "cotizaciones", cotizacionesFiltradas, columnas, usuarioActual, filtrosTexto);

    const abrirConvertir = (cotizacion) => {
        setCotizacionSeleccionada(cotizacion);
        setCondicionId("");
        setMontoRecibido("");
        setOpenConvertir(true);
    };

    const convertirAFactura = async () => {
        if (!cotizacionSeleccionada) return;

        const payload = {
            condicion_id: condicionId,
            monto_recibido: Number(montoRecibido) || 0,
        };

        try {
            const res = await axios.post(
                `${API_URL}/api/cotizaciones/${cotizacionSeleccionada.id_cotizaciones}/convertir`,
                payload
            );

            // Aquí usamos directamente los datos que vienen
            const { factura_id, numero_documento, message } = res.data;

            console.log(message);

            generarDocumentoPDF({
                tipo: "Factura",
                numero_documento,
                fecha: new Date().toLocaleString(),
                cliente_nombre: cotizacionSeleccionada.cliente,
                condicion_pago: condicionesPago.find(c => c.id_condiciones_pago === condicionId)?.nombre || "",
                detalles: cotizacionSeleccionada.detalles,
                total: cotizacionSeleccionada.total,
                monto_recibido: Number(montoRecibido) || 0,
                cambio: 0,
            });

            setOpenConvertir(false);
            loadCotizaciones();

        } catch (err) {
            console.error("Error al convertir cotización:", err.response?.data || err.message);
        }
    };



    const condicionSeleccionada = condicionesPago.find((c) => c.id_condiciones_pago === condicionId);
    const esContado = condicionSeleccionada && Number(condicionSeleccionada.dias_plazo) === 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const cotizacionesPaginadas = cotizacionesFiltradas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
            <Typography variant="h4" mb={3}>
                Consulta de Cotizaciones
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button variant="contained" onClick={exportExcel}>
                    Exportar Excel
                </Button>
                <Button variant="contained" color="secondary" onClick={exportPDF}>
                    Exportar PDF
                </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                        value={filtros.cliente}
                        label="Cliente"
                        onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {clientes.map((c) => (
                            <MenuItem key={c.id} value={c.nombre}>
                                {c.nombre}
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
                />
            </Box>

            {loading && <CircularProgress />}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>ID</TableCell>
                            <TableCell>Cliente</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cotizacionesPaginadas.map((c) => (
                            <React.Fragment key={c.id_cotizaciones}>
                                <TableRow>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                setOpenRows((p) => ({ ...p, [c.id_cotizaciones]: !p[c.id_cotizaciones] }))
                                            }
                                        >
                                            {openRows[c.id_cotizaciones] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>{c.id_cotizaciones}</TableCell>
                                    <TableCell>{c.cliente}</TableCell>
                                    <TableCell>{new Date(c.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>${Number(c.total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Button size="small" variant="contained" onClick={() => abrirConvertir(c)}>
                                            Convertir a Factura
                                        </Button>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell colSpan={6} sx={{ p: 0 }}>
                                        <Collapse in={openRows[c.id_cotizaciones]}>
                                            <Box sx={{ m: 2 }}>
                                                <Typography variant="subtitle1">Detalle</Typography>
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
                                                        {c.detalles.map((d) => (
                                                            <TableRow key={d.id_cotizacion_detalle}>
                                                                <TableCell>{d.producto}</TableCell>
                                                                <TableCell align="right">{d.cantidad}</TableCell>
                                                                <TableCell align="right">${Number(d.precio_unitario).toFixed(2)}</TableCell>
                                                                <TableCell align="right">${Number(d.subtotal).toFixed(2)}</TableCell>
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
                    count={cotizacionesFiltradas.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </TableContainer>

            <Dialog open={openConvertir} onClose={() => setOpenConvertir(false)} fullWidth maxWidth="sm">
                <DialogTitle>Convertir Cotización a Factura</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Condición de Pago</InputLabel>
                        <Select value={condicionId} label="Condición de Pago" onChange={(e) => setCondicionId(e.target.value)}>
                            {condicionesPago.filter((c) => c.activo).map((c) => (
                                <MenuItem key={c.id_condiciones_pago} value={c.id_condiciones_pago}>
                                    {c.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {esContado && (
                        <TextField
                            fullWidth
                            sx={{ mt: 2 }}
                            label="Monto recibido"
                            type="number"
                            value={montoRecibido}
                            onChange={(e) => setMontoRecibido(e.target.value)}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConvertir(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={convertirAFactura}
                        disabled={!condicionId || (esContado && (!montoRecibido || Number(montoRecibido) <= 0))}
                    >
                        Crear Factura
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
