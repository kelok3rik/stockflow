// src/pages/POSScreen.jsx
import React, { useEffect, useState } from 'react';
import { Container, Grid } from '@mui/material';
import ProductosList from './ProductList';
import Carrito from './Carrito';
import FacturaTicket from './FacturaTicket';
import { useFactura } from './useFactura';
import axios from 'axios';

export default function POSScreen() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const {
    cart, addToCart, removeFromCart, updateQuantity, calculateTotal,
    saleType, setSaleType, cashReceived, setCashReceived,
    selectedCliente, setSelectedCliente, fechaVencimiento, setFechaVencimiento,
    isLoading, handleCheckout, facturaId, openDialog, handleDialogClose, ticketRef
  } = useFactura();

  useEffect(() => {
    // Obtener productos
    const fetchProductos = async () => {
      try {
        const res = await axios.get('/api/productos');
        setProductos(res.data);
      } catch (error) {
        console.error('Error al cargar productos:', error.message);
      }
    };

    // Obtener clientes
    const fetchClientes = async () => {
      try {
        const res = await axios.get('/api/clientes');
        setClientes(res.data);
      } catch (error) {
        console.error('Error al cargar clientes:', error.message);
      }
    };

    fetchProductos();
    fetchClientes();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ProductosList products={productos} addToCart={addToCart} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Carrito
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
            saleType={saleType}
            setSaleType={setSaleType}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            selectedCliente={selectedCliente}
            setSelectedCliente={setSelectedCliente}
            fechaVencimiento={fechaVencimiento}
            setFechaVencimiento={setFechaVencimiento}
            clientes={clientes}
            handleCheckout={handleCheckout}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Componente oculto para impresión */}
      <div style={{ display: 'none' }}>
        <FacturaTicket
          ref={ticketRef}
          cart={cart}
          total={calculateTotal()}
          cashReceived={saleType === 'contado' ? cashReceived : 0}
          change={saleType === 'contado' ? cashReceived - calculateTotal() : 0}
          facturaId={facturaId}
        />
      </div>
    </Container>
  );
}
