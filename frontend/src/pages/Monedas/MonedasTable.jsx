// src/pages/Monedas/MonedasTable.jsx
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  IconButton,
  TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

export default function MonedasTable({ monedas, onEdit, onDelete }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = monedas.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Símbolo</TableCell>
              <TableCell align="right">Tasa</TableCell>
              <TableCell>Base</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map(m => (
              <TableRow key={m.id_monedas}>
                <TableCell>{m.codigo}</TableCell>
                <TableCell>{m.nombre}</TableCell>
                <TableCell>{m.simbolo}</TableCell>
                <TableCell align="right">{Number(m.tasa_cambio).toFixed(4)}</TableCell>
                <TableCell>{m.es_base ? "Sí" : "No"}</TableCell>
                <TableCell>{m.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(m)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay monedas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={monedas.length}
        page={page}
        onPageChange={(_, v) => setPage(v)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}
