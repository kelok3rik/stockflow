// src/pages/monedas/MonedasConsulta.jsx
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

export default function MonedasConsulta() {
    const [monedas, setMonedas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        nombre: "",
        codigo: "",
        es_base: "",
        activo: "",
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadMonedas = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/monedas`);
            setMonedas(res.data || []);
        } catch (error) {
            console.error("Error cargando monedas", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMonedas();
    }, []);

    // Filtrado
    const monedasFiltradas = monedas.filter((m) => {
        const nombreMatch = m.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
        const codigoMatch = m.codigo.toLowerCase().includes(filtros.codigo.toLowerCase());
        const esBaseMatch =
            filtros.es_base === ""
                ? true
                : filtros.es_base === "true"
                    ? m.es_base === true
                    : m.es_base === false;
        const activoMatch =
            filtros.activo === ""
                ? true
                : filtros.activo === "true"
                    ? m.activo === true
                    : m.activo === false;
        return nombreMatch && codigoMatch && esBaseMatch && activoMatch;
    });

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // EXPORTAR EXCEL
    const exportExcel = () => {
        const exportData = monedasFiltradas.map((m) => ({
            Nombre: m.nombre,
            Código: m.codigo,
            Símbolo: m.simbolo,
            "Tasa de Cambio": m.tasa_cambio,
            "Es Base": m.es_base ? "Sí" : "No",
            Activo: m.activo ? "Sí" : "No",
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Monedas");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "monedas.xlsx");
    };

    // EXPORTAR PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Nombre", "Código", "Símbolo", "Tasa de Cambio", "Es Base", "Activo"];
        const tableRows = monedasFiltradas.map((m) => [
            m.nombre,
            m.codigo,
            m.simbolo,
            m.tasa_cambio,
            m.es_base ? "Sí" : "No",
            m.activo ? "Sí" : "No",
        ]);
        doc.text("Listado de Monedas", 14, 15);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("monedas.pdf");
    };

    return (
        <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
            <Typography variant="h4" mb={3}>
                Consulta de Monedas
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
                    label="Buscar por código"
                    variant="outlined"
                    value={filtros.codigo}
                    onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
                    sx={{ minWidth: 150 }}
                />

                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <InputLabel>Es Base</InputLabel>
                    <Select
                        label="Es Base"
                        value={filtros.es_base}
                        onChange={(e) => setFiltros({ ...filtros, es_base: e.target.value })}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="true">Sí</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                    </Select>
                </FormControl>

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
                            <TableCell>Código</TableCell>
                            <TableCell>Símbolo</TableCell>
                            <TableCell>Tasa de Cambio</TableCell>
                            <TableCell>Es Base</TableCell>
                            <TableCell>Activo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {monedasFiltradas.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No se encontraron monedas
                                </TableCell>
                            </TableRow>
                        ) : (
                            monedasFiltradas
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((m) => (
                                    <TableRow key={m.id_monedas}>

                                        <TableCell>{m.nombre}</TableCell>
                                        <TableCell>{m.codigo}</TableCell>
                                        <TableCell>{m.simbolo}</TableCell>
                                        <TableCell>{m.tasa_cambio}</TableCell>
                                        <TableCell>{m.es_base ? "Sí" : "No"}</TableCell>
                                        <TableCell>{m.activo ? "Sí" : "No"}</TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
                component="div"
                count={monedasFiltradas.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Box>
    );
}
