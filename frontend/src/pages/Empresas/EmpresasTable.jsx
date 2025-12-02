import {
  Table, TableBody, TableCell,
  TableContainer, TableHead,
  TableRow, Paper, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function EmpresasTable({ empresas, monedas, onEdit }) {

  const getNombreMoneda = (id) => {
    const moneda = monedas.find(m => String(m.id_monedas) === String(id));
    return moneda ? moneda.nombre : "N/D";
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>RNC</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Moneda base</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {empresas.map((empresa) => (
            <TableRow key={empresa.id_empresa}>
              <TableCell>{empresa.nombre}</TableCell>
              <TableCell>{empresa.rnc}</TableCell>
              <TableCell>{empresa.telefono}</TableCell>
              <TableCell>{empresa.email}</TableCell>

              {/* ✅ MONEDA CORRECTA */}
              <TableCell>
                {getNombreMoneda(empresa.moneda_base_id)}
              </TableCell>

              <TableCell>
                <IconButton onClick={() => onEdit(empresa)}>
                  <EditIcon />
                </IconButton>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
