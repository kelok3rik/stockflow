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

export default function AlmacenesTable({ almacenes = [], onEdit }) {
  const lista = Array.isArray(almacenes) ? almacenes : [];

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
            <TableCell>Estado</TableCell>
            <TableCell align="center">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lista.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No hay almacenes registrados
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((a) => (
              <TableRow key={a.id_almacen || a.codigo}>
                <TableCell noWrap>{a.codigo}</TableCell>
                <TableCell>{a.nombre}</TableCell>
                <TableCell>{a.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => onEdit?.(a)}>
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
        labelRowsPerPage="Filas por página"
      />
    </TableContainer>
  );
}
