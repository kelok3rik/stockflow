// src/pages/usuarios/UsuarioVentanasPage.jsx
import {
    Box, Typography, TextField, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, TablePagination, CircularProgress, Snackbar, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import useUsuariosVentanas from "./useUsuariosVentanas";
import VentanasModal from "./UsuariosVentanasModal";

export default function UsuarioVentanasPage() {
    const { usuarios, loading, updatePermisos } = useUsuariosVentanas();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openModal, setOpenModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const handleOpenModal = (usuario) => {
        setSelectedUsuario(usuario);
        setOpenModal(true);
    };
    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedUsuario(null);
    };

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filtered = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Función que se pasa al modal para actualizar permisos
    const handleSave = async (usuarioId, permisos) => {
        try {
            await updatePermisos(usuarioId, permisos);
            setSnackbar({ open: true, message: "Permisos actualizados", severity: "success" });
            handleCloseModal();
        } catch (error) {
            setSnackbar({ open: true, message: "Error al actualizar permisos", severity: "error" });
        }
    };

    return (
        <Box>
            <Typography variant="h5" mb={2}>Usuario vs Ventanas</Typography>

            <Box display="flex" gap={2} mb={2}>
                <TextField
                    label="Buscar usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Usuario</TableCell>
                                <TableCell>Activo</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginated.map(u => (
                                <TableRow key={u.id_usuarios}>
                                    <TableCell>{u.nombre}</TableCell>
                                    <TableCell>{u.usuario}</TableCell>
                                    <TableCell>{u.activo ? "Activo" : "Inactivo"}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenModal(u)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginated.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No hay usuarios</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </TableContainer>
            )}

            {selectedUsuario && (
                <VentanasModal
                    open={openModal}
                    onClose={handleCloseModal}
                    usuario={selectedUsuario}
                    onSave={handleSave}
                />
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>

        </Box>
    );
}
