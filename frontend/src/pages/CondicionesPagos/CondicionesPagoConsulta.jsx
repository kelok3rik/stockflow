// src/pages/condiciones-pago/CondicionesPagoConsulta.jsx
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

export default function CondicionesPagoConsulta() {
    const [condiciones, setCondiciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        nombre: "",
        dias_plazo: "",
        activo: "",
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadCondiciones = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/condiciones-pago`);
            setCondiciones(res.data || []);
        } catch (error) {
            console.error("Error cargando condiciones de pago", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCondiciones();
    }, []);

    // Filtrado
    const condicionesFiltradas = condiciones.filter((c) => {
        const nombreMatch = c.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
        const diasMatch =
            filtros.dias_plazo === ""
                ? true
                : Number(filtros.dias_plazo) === Number(c.dias_plazo);
        const activoMatch =
            filtros.activo === ""
                ? true
                : filtros.activo === "true"
                    ? c.activo === true
                    : c.activo === false;
        return nombreMatch && diasMatch && activoMatch;
    });

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Exportar Excel
    const exportExcel = () => {
        const exportData = condicionesFiltradas.map((c) => ({
            Nombre: c.nombre,
            "Días Plazo": c.dias_plazo,
            Activo: c.activo ? "Sí" : "No",
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CondicionesPago");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "condiciones_pago.xlsx");
    };

    // Exportar PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Nombre", "Días Plazo", "Activo"];
        const tableRows = condicionesFiltradas.map((c) => [
            c.nombre,
            c.dias_plazo,
            c.activo ? "Sí" : "No",
        ]);
        doc.text("Listado de Condiciones de Pago", 14, 15);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("condiciones_pago.pdf");
    };

    return (
        <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
            <Typography variant="h4" mb={3}>
                Consulta de Condiciones de Pago
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
                    label="Buscar por nombre"
                    variant="outlined"
                    value={filtros.nombre}
                    onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
                    sx={{ minWidth: 200 }}
                />
                <TextField
                    label="Días Plazo"
                    type="number"
                    variant="outlined"
                    value={filtros.dias_plazo}
                    onChange={(e) => setFiltros({ ...filtros, dias_plazo: e.target.value })}
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

            {/* Estado de carga */}
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

                            <TableCell>Nombre</TableCell>
                            <TableCell>Días Plazo</TableCell>
                            <TableCell>Activo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {condicionesFiltradas.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No se encontraron registros
                                </TableCell>
                            </TableRow>
                        ) : (
                            condicionesFiltradas
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((c) => (
                                    <TableRow key={c.id_condiciones_pago}>

                                        <TableCell>{c.nombre}</TableCell>
                                        <TableCell>{c.dias_plazo}</TableCell>
                                        <TableCell>{c.activo ? "Sí" : "No"}</TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
                component="div"
                count={condicionesFiltradas.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Box>
    );
}
