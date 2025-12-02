import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination,
  Paper, IconButton
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useState } from "react";

export default function GruposTable({ grupos = [], onEdit }) {

  const lista = Array.isArray(grupos) ? grupos : [];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const paginated = lista.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>

      <Table>

        <TableHead>
          <TableRow>
            
            <TableCell>Grupo</TableCell>
            <TableCell>Departamento</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>

        <TableBody>

          {paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No hay grupos
              </TableCell>
            </TableRow>
          ) : (
            paginated.map(row => (
              <TableRow key={row.id_grupos}>
                
                <TableCell>{row.nombre}</TableCell>

                {/* ✅ Muestra nombre del departamento */}
                <TableCell>{row.departamento_nombre}</TableCell>

                <TableCell>
                  {row.activo ? "Activo" : "Inactivo"}
                </TableCell>

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
        count={lista.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(e, n) => setPage(n)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20]}
      />

    </TableContainer>
  );
}
