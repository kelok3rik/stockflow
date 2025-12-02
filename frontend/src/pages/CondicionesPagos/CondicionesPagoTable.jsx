import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function CondicionesPagoTable({ condiciones, onEdit }) {

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Días</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell width={100}>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {condiciones.map(c => (
            <TableRow key={c.id_condiciones_pago}>
              <TableCell>{c.nombre}</TableCell>
              <TableCell>{c.dias_plazo}</TableCell>
              <TableCell>{c.activo ? "Activo" : "Inactivo"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(c)}>
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {condiciones.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">No hay registros</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
