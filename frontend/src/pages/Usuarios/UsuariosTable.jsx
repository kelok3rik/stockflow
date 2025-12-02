// src/pages/usuarios/UsuariosTable.jsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function UsuariosTable({ usuarios, onEdit, roles }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Clave</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((u) => {
            const rolNombre = (roles || []).find(
              r => r?.id_roles != null && u?.id_rol != null && r.id_roles.toString() === u.id_rol.toString()
            )?.nombre || "";

            return (
              <TableRow key={u.id_usuarios}>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.usuario}</TableCell>
                <TableCell>{rolNombre}</TableCell>
                <TableCell>{u.clave}</TableCell>
                <TableCell>{u.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit(u)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          {usuarios.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No hay usuarios</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
