// src/pages/clientes/ClientesTable.jsx
import { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, TablePagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function ClientesTable({ clientes = [], onEdit }) {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = clientes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>
      <Table>

        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Documento</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>
          {paginated.map((c) => (
            <TableRow key={c.id_clientes}>
              <TableCell>{c.nombre}</TableCell>
              <TableCell>{c.doc_identidad}</TableCell>
              <TableCell>{c.email}</TableCell>
              <TableCell>{c.telefono}</TableCell>
              <TableCell>{c.direccion}</TableCell>
              <TableCell>{c.activo ? "Activo" : "Inactivo"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(c)}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {clientes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No hay clientes registrados
              </TableCell>
            </TableRow>
          )}
        </TableBody>

      </Table>

      <TablePagination
        component="div"
        count={clientes.length}
        page={page}
        onPageChange={(e, n) => setPage(n)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </TableContainer>
  );
}
