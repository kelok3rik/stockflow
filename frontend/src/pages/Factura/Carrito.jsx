import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

export default function Carrito({ cart, removeFromCart, updateQuantity }) {
  const safeCart = Array.isArray(cart) ? cart : [];

  return (
    <TableContainer sx={{ maxHeight: 300 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeCart.map((item) => (
            <TableRow key={item.id_productos}>
              <TableCell>{item.nombre}</TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id_productos, e.target.value)}
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </TableCell>
              <TableCell>${(parseFloat(item.precio_venta) * item.quantity).toFixed(2)}</TableCell>
              <TableCell>
                <IconButton color="error" onClick={() => removeFromCart(item.id_productos)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
