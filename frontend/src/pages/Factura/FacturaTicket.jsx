import React, { forwardRef } from 'react';
import { Typography, Box, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const FacturaTicket = forwardRef(({ factura }, ref) => {
  if (!factura) return null;

  return (
    <Box ref={ref} sx={{ p: 2, width: 300 }}>
      <Typography variant="h6" align="center">Factura #{factura.id_facturas}</Typography>
      <Typography align="center">{new Date(factura.fecha).toLocaleDateString()}</Typography>
      <Typography align="center">Cliente: {factura.cliente_nombre}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell>Cant.</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Subtotal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {factura.detalles.map(d => (
            <TableRow key={d.id_factura_detalle}>
              <TableCell>{d.producto}</TableCell>
              <TableCell>{d.cantidad}</TableCell>
              <TableCell>${d.precio_unitario}</TableCell>
              <TableCell>${(d.cantidad * d.precio_unitario).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography align="right" sx={{ mt: 2, fontWeight: 'bold' }}>Total: ${factura.total}</Typography>
    </Box>
  );
});

export default FacturaTicket;
