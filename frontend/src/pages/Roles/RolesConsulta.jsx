// src/pages/roles/RolesConsulta.jsx
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

export default function RolesConsulta() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({
        nombre: "",
        activo: "",
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/roles`);
            setRoles(res.data || []);
        } catch (error) {
            console.error("Error cargando roles", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    // Filtrado
    const rolesFiltrados = roles.filter((r) => {
        const nombreMatch = r.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
        const activoMatch =
            filtros.activo === ""
                ? true
                : filtros.activo === "true"
                    ? r.activo === true
                    : r.activo === false;
        return nombreMatch && activoMatch;
    });

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // EXPORTAR EXCEL
    const exportExcel = () => {
        const exportData = rolesFiltrados.map((r) => ({
            Nombre: r.nombre,
            Descripción: r.descripcion,
            Activo: r.activo ? "Sí" : "No",
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "roles.xlsx");
    };

    // EXPORTAR PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Nombre", "Descripción", "Activo"];
        const tableRows = rolesFiltrados.map((r) => [r.nombre, r.descripcion, r.activo ? "Sí" : "No"]);
        doc.text("Listado de Roles", 14, 15);
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("roles.pdf");
    };

    return (
        <Box sx={{ p: 3, maxWidth: "95%", mx: "auto" }}>
            <Typography variant="h4" mb={3}>
                Consulta de Roles
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

                <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                    <InputLabel>Activo</InputLabel>
                    <Select
                        label="Activo"
                        value={filtros.activo}
                        onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="true">Activo</MenuItem>
                        <MenuItem value="false">Inactivo</MenuItem>
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
                            <TableCell>Descripción</TableCell>
                            <TableCell>Activo</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rolesFiltrados.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No se encontraron roles
                                </TableCell>
                            </TableRow>
                        ) : (
                            rolesFiltrados
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((r) => (
                                    <TableRow key={r.id_roles}>

                                        <TableCell>{r.nombre}</TableCell>
                                        <TableCell>{r.descripcion}</TableCell>
                                        <TableCell>{r.activo ? "Sí" : "No"}</TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
                component="div"
                count={rolesFiltrados.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Box>
    );
}
