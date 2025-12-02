// src/pages/proveedores/ProveedoresTable.jsx
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function ProveedoresTable({ proveedores, onEdit }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>RNC</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {proveedores.map((row) => (
            <TableRow key={row.id_proveedores}>
              <TableCell>{row.nombre}</TableCell>
              <TableCell>{row.rnc}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.telefono}</TableCell>
              <TableCell>{row.direccion}</TableCell>
              <TableCell>{row.activo ? "Sí" : "No"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(row)}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {proveedores.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No hay proveedores
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
