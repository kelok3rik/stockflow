// src/pages/Departamentos/DepartamentosTable.jsx
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

export default function DepartamentosTable({ departamentos = [], onEdit }) {
  const lista = Array.isArray(departamentos) ? departamentos : [];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
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
            <TableCell>Nombre</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lista.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center">
                No hay departamentos
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((d) => (
              <TableRow key={d.id_departamentos}>
                <TableCell>{d.nombre}</TableCell>
                <TableCell>{d.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(d)}>
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
      />
    </TableContainer>
  );
}
