// src/pages/productos/ProductosTable.jsx
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Paper,
  Tab,
} from "@mui/material";
import { Edit } from "@mui/icons-material";

export default function ProductosTable({ productos = [], onEdit }) {
  const lista = Array.isArray(productos) ? productos : [];

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = lista.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Código</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Costo</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Unidad</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Stock Mínimo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {lista.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No hay productos registrados
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((p) => (
              <TableRow key={p.id || p.codigo}>
                <TableCell noWrap>{p.codigo}</TableCell>
                <TableCell>{p.nombre}</TableCell>
                <TableCell>{p.costo}</TableCell>
                <TableCell>{p.precio}</TableCell>
                <TableCell>{p.unidad}</TableCell>
                <TableCell>{p.stock ?? "-"}</TableCell>
                <TableCell>{p.stock_min ?? "-"}</TableCell>
                <TableCell>{p.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEdit?.(p)}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
