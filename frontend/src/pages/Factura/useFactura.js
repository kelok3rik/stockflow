import { useState } from 'react';
import axios from 'axios';

export function useFactura() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Cargar productos desde el backend ---
  const loadProducts = async () => {
    try {
      const response = await axios.get('/api/productos'); // Ajusta tu endpoint
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al cargar productos:', error.message);
      setProducts([]);
    }
  };

  // --- Cargar clientes ---
  const loadClientes = async () => {
    try {
      const response = await axios.get('/api/clientes'); // Ajusta tu endpoint
      setClientes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al cargar clientes:', error.message);
      setClientes([]);
    }
  };

  // --- Carrito ---
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id_productos === product.id_productos);
      if (exists) {
        return prev.map((item) =>
          item.id_productos === product.id_productos
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id_productos) => {
    setCart((prev) => prev.filter((item) => item.id_productos !== id_productos));
  };

  const updateQuantity = (id_productos, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id_productos === id_productos
          ? { ...item, quantity: Math.max(1, parseInt(quantity, 10) || 1) }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + parseFloat(item.precio_venta) * item.quantity,
      0
    );
  };

  // --- Procesar venta ---
  const processSale = async ({ usuario_id, saleType, selectedCliente, fechaVencimiento, cashReceived }) => {
    if (cart.length === 0) throw new Error('El carrito está vacío');

    const total = calculateTotal();

    if (saleType === 'contado' && cashReceived < total) {
      throw new Error('Efectivo insuficiente');
    }

    if (saleType === 'credito' && (!selectedCliente || !fechaVencimiento)) {
      throw new Error('Cliente o fecha de vencimiento no definida para crédito');
    }

    setIsLoading(true);

    try {
      const saleRecord = {
        total,
        usuario_id,
      };

      const detalles = cart.map((item) => ({
        producto_id: item.id_productos,
        cantidad: item.quantity,
        precio_unitario: parseFloat(item.precio_venta),
      }));

      let ventaId;
      if (saleType === 'credito') {
        ventaId = await axios.post('/api/ventas/credito', {
          saleRecord,
          detalles,
          cliente_id: selectedCliente,
          fecha_vencimiento: fechaVencimiento,
        });
      } else {
        ventaId = await axios.post('/api/ventas/contado', { saleRecord, detalles });
      }

      // Limpiar carrito después de la venta
      setCart([]);
      return ventaId.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    cart,
    clientes,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    processSale,
    loadProducts,
    loadClientes,
  };
}
