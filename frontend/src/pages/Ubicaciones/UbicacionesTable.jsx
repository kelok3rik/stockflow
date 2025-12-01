import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Paper,
} from "@mui/material";
import { Edit } from "@mui/icons-material";

export default function UbicacionesTable({ ubicaciones = [], onEdit }) {
  const lista = Array.isArray(ubicaciones) ? ubicaciones : [];

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = lista.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Almacén</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lista.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No hay ubicaciones registradas
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((u) => (
              <TableRow key={u.id_ubicaciones || u.codigo}>
                <TableCell noWrap>{u.codigo}</TableCell>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.almacen ?? u.id_almacen ?? "-"}</TableCell>
                <TableCell>{u.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onEdit?.(u)}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={lista.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Filas por página"
      />
    </TableContainer>
  );
}
