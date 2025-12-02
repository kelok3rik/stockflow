// src/pages/usuarios/UsuarioVentanasTable.jsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

export default function UsuarioVentanasTable({ usuarios, onAsignar }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell>Asignar Ventanas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map(u => (
            <TableRow key={u.id_usuarios}>
              <TableCell>{u.nombre}</TableCell>
              <TableCell>{u.usuario}</TableCell>
              <TableCell>{u.activo ? "Activo" : "Inactivo"}</TableCell>
              <TableCell>
                <IconButton onClick={() => onAsignar(u)}>
                  <SettingsIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {usuarios.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">No hay usuarios</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
