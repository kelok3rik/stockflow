import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination,
  Paper, IconButton
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useState } from "react";

export default function TiposMovimientoTable({ data = [], onEdit }) {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>

      <Table>

        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Clase</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>

          {paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No hay registros
              </TableCell>
            </TableRow>
          ) : (
            paginated.map(row => (
              <TableRow key={row.id_tipos_movimiento}>
                <TableCell>{row.nombre}</TableCell>
                <TableCell>{row.clase}</TableCell>
                <TableCell>{row.descripcion || "-"}</TableCell>
                <TableCell>{row.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(row)}>
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
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, n) => setPage(n)}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />

    </TableContainer>
  );
}
