import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';

export default function ProductosList({ products, addToCart, searchTerm, page, rowsPerPage }) {
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((product) => (
              <TableRow key={product.id_productos}>
                <TableCell>{product.nombre}</TableCell>
                <TableCell>${parseFloat(product.precio_venta).toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => addToCart(product)}>
                    Agregar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
