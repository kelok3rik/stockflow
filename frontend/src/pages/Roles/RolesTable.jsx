// src/pages/roles/RolesTable.jsx
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton,
  TablePagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

export default function RolesTable({ roles, search, onEdit, onDelete }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filtered = roles.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map(r => (
            <TableRow key={r.id_roles}>
              <TableCell>{r.nombre}</TableCell>
              <TableCell>{r.descripcion}</TableCell>
              <TableCell>{r.activo ? "Activo" : "Inactivo"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(r)}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">No hay roles</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </TableContainer>
  );
}
