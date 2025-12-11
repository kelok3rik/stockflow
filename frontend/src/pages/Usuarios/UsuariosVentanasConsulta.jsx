import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
    useMediaQuery,
} from "@mui/material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsuarioVentanaConsulta() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filtros, setFiltros] = useState({
        usuario: "",
        ventana: "",
        activo: "",
        // Inventario
        inv_productos: "",
        inv_almacenes: "",
        inv_ubicaciones: "",
        inv_departamentos: "",
        inv_grupos: "",
        inv_cotizaciones: "",
        inv_compras: "",
        inv_movimientos: "",
        inv_devoluciones: "",
        inv_facturacion: "",
        inv_consultas: "",
        inv_reportes: "",
        // CxC
        cxc_clientes: "",
        cxc_cobros: "",
        // CxP
        cxp_proveedores: "",
        cxp_pagos: "",
        // Configuración
        conf_usuario: "",
        conf_roles: "",
        conf_empresa: "",
        conf_moneda: "",
        conf_condicion: "",
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const isMobile = useMediaQuery("(max-width:900px)");

    const permisoKeys = [
        "inv_productos",
        "inv_almacenes",
        "inv_ubicaciones",
        "inv_departamentos",
        "inv_grupos",
        "inv_cotizaciones",
        "inv_compras",
        "inv_movimientos",
        "inv_devoluciones",
        "inv_facturacion",
        "inv_consultas",
        "inv_reportes",
        "cxc_clientes",
        "cxc_cobros",
        "cxp_proveedores",
        "cxp_pagos",
        "conf_usuario",
        "conf_roles",
        "conf_empresa",
        "conf_moneda",
        "conf_condicion",
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/usuarios`);
            setData(res.data || []);
        } catch (error) {
            console.error("Error cargando usuarios", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const renderPermiso = (valor) => (valor ? "Sí" : "No");

    const dataFiltrada = data.filter((d) => {
        for (let key in filtros) {
            if (filtros[key] === "") continue;
            const filtroTrue = filtros[key] === "true";
            if ((filtroTrue && !d[key]) || (!filtroTrue && d[key])) return false;
        }
        return true;
    });

    // EXPORTAR A EXCEL
    const exportExcel = () => {
        const exportData = dataFiltrada.map((d) => {
            const obj = {
                Nombre: d.nombre,
                Usuario: d.usuario,
                Rol: d.rol,
                Activo: renderPermiso(d.activo),
            };
            permisoKeys.forEach((key) => {
                obj[key.replace(/_/g, " ")] = renderPermiso(d[key]);
            });
            return obj;
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        saveAs(blob, "usuarios.xlsx");
    };

    // EXPORTAR A PDF
    // EXPORTAR A PDF (Horizontal)
    const exportPDF = () => {
        const doc = new jsPDF({
            orientation: "landscape", // horizontal
            unit: "mm",
            format: "a4",
        });

        const columns = [
            "Nombre",
            "Usuario",
            "Rol",
            "Activo",
            ...permisoKeys.map((k) => k.replace(/_/g, " ")),
        ];

        const rows = dataFiltrada.map((d) => [
            d.nombre,
            d.usuario,
            d.rol,
            renderPermiso(d.activo),
            ...permisoKeys.map((key) => renderPermiso(d[key])),
        ]);

        doc.setFontSize(8);
        doc.text("Usuarios vs Ventana", 14, 15);

        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: 20,
            styles: { fontSize: 7 },
            headStyles: { fillColor: [22, 160, 133] },
            theme: "striped",
            showHead: "everyPage", // repetir encabezado en cada página si hay muchas filas
        });

        doc.save("usuarios.pdf");
    };


    return (
        <Box sx={{ p: 2, maxWidth: "100%", mx: "auto" }}>
            <Typography variant="h5" mb={2}>
                Consulta Usuario vs Ventana
            </Typography>

            {/* Botones Exportar */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Button variant="contained" color="primary" onClick={exportExcel}>
                    Exportar Excel
                </Button>
                <Button variant="contained" color="secondary" onClick={exportPDF}>
                    Exportar PDF
                </Button>
            </Box>

            {/* Filtros */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(6, 1fr)" },
                    gap: 2,
                    mb: 2,
                }}
            >
                <TextField
                    label="Usuario"
                    value={filtros.usuario}
                    onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
                />
                <FormControl>
                    <InputLabel>Activo</InputLabel>
                    <Select
                        value={filtros.activo}
                        onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
                        label="Activo"
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="true">Activo</MenuItem>
                        <MenuItem value="false">Inactivo</MenuItem>
                    </Select>
                </FormControl>
                {permisoKeys.map((key) => (
                    <FormControl key={key}>
                        <InputLabel>{key.replace(/_/g, " ")}</InputLabel>
                        <Select
                            value={filtros[key]}
                            onChange={(e) => setFiltros({ ...filtros, [key]: e.target.value })}
                            label={key}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="true">Sí</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                        </Select>
                    </FormControl>
                ))}
            </Box>

            {/* Tabla */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: isMobile ? 400 : 600 }}>
                    <Box sx={{ overflowX: "auto" }}>
                        <Table stickyHeader size={isMobile ? "small" : "medium"}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Activo</TableCell>
                                    {permisoKeys.map((key) => (
                                        <TableCell key={key}>{key.replace(/_/g, " ")}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dataFiltrada.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={26} align="center">
                                            No se encontraron registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    dataFiltrada
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((d) => (
                                            <TableRow key={d.id_usuarios}>
                                                <TableCell>{d.nombre}</TableCell>
                                                <TableCell>{d.usuario}</TableCell>
                                                <TableCell>{d.rol}</TableCell>
                                                <TableCell>{renderPermiso(d.activo)}</TableCell>
                                                {permisoKeys.map((key) => (
                                                    <TableCell key={key}>{renderPermiso(d[key])}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </TableContainer>
            )}

            <TablePagination
                component="div"
                count={dataFiltrada.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Box>
    );
}
