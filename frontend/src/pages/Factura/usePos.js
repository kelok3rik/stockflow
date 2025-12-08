// frontend/src/pages/Factura/usePos.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function usePos() {
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [condicionesPago, setCondicionesPago] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [loading, setLoading] = useState(true);

    // =======================================================
    // Normalizar producto: convierte strings numéricos a números
    // =======================================================
    const normalizeProduct = (p) => ({
        ...p,
        id_productos: Number(p.id_productos),
        departamento_id: Number(p.departamento_id),
        grupo_id: Number(p.grupo_id),
        ubicacion_id: Number(p.ubicacion_id),
        precio_venta: Number(p.precio_venta),
        costo: Number(p.costo),
        stock: Number(p.stock),
        stock_min: Number(p.stock_min),
    });

    // =======================================================
    // Normalizar cliente: mapea id_clientes a id y convierte a número
    // =======================================================
    const normalizeCliente = (c) => ({
        ...c,
        id: Number(c.id_clientes),
        id_clientes: Number(c.id_clientes),
    });

    // =======================================================
    // Normalizar condición de pago: mapea id_condiciones_pago a id
    // =======================================================
    const normalizeCondicionPago = (cp) => ({
        ...cp,
        id: Number(cp.id_condiciones_pago),
        id_condiciones_pago: Number(cp.id_condiciones_pago),
        dias_plazo: Number(cp.dias_plazo),
    });

    // =======================================================
    // Cargar productos, clientes y condiciones de pago
    // =======================================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, cliRes, condRes] = await Promise.all([
                    axios.get(`${API_URL}/api/productos`),
                    axios.get(`${API_URL}/api/clientes`),
                    axios.get(`${API_URL}/api/condiciones-pago`),
                ]);

                console.log("Condiciones de pago crudas:", condRes.data);
                
                // normalizar productos
                setProductos(prodRes.data.map(normalizeProduct));

                // normalizar clientes
                setClientes(cliRes.data.map(normalizeCliente));

                // normalizar condiciones de pago y filtrar solo activas
                const condicionesActivas = condRes.data
                    .filter(cp => cp.activo === true || cp.activo === "true")
                    .map(normalizeCondicionPago);
                
                console.log("Condiciones de pago normalizadas:", condicionesActivas);
                setCondicionesPago(condicionesActivas);

            } catch (error) {
                console.error("Error cargando datos del POS:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // =======================================================
    // Agregar producto al carrito
    // =======================================================
    const addToCart = (producto) => {
        const existe = carrito.find(
            (i) => i.id_productos === producto.id_productos
        );

        if (existe) {
            setCarrito(
                carrito.map((i) =>
                    i.id_productos === producto.id_productos
                        ? { ...i, cantidad: i.cantidad + 1 }
                        : i
                )
            );
        } else {
            setCarrito([
                ...carrito,
                {
                    ...producto,
                    cantidad: 1,
                    precio_unitario: producto.precio_venta,
                },
            ]);
        }
    };

    // =======================================================
    // Cambiar cantidad
    // =======================================================
    const changeQuantity = (id, cantidad) => {
        if (cantidad <= 0) return;

        setCarrito(
            carrito.map((i) =>
                i.id_productos === id ? { ...i, cantidad } : i
            )
        );
    };

    // =======================================================
    // Eliminar del carrito
    // =======================================================    
    const removeFromCart = (id) => {
        setCarrito(carrito.filter((i) => i.id_productos !== id));
    };

    // =======================================================
    // Total de la factura
    // =======================================================
    const total = carrito.reduce(
        (acc, item) => acc + item.cantidad * item.precio_unitario,
        0
    );

    // =======================================================
    // Procesar factura
    // =======================================================
    const procesarFactura = async (cliente_id, condicion_pago_id, usuario_id = 1) => {
        console.log("Procesando factura con:", {
            cliente_id,
            condicion_pago_id,
            tipo_cliente: typeof cliente_id,
            tipo_condicion: typeof condicion_pago_id
        });

        // Validaciones
        if (!cliente_id || cliente_id === "") {
            return { error: "Debe seleccionar un cliente." };
        }

        if (!condicion_pago_id || condicion_pago_id === "") {
            return { error: "Debe seleccionar una condición de pago." };
        }

        if (carrito.length === 0) {
            return { error: "Debe agregar productos." };
        }

        // Convertir a números
        const clienteIdNum = Number(cliente_id);
        const condicionIdNum = Number(condicion_pago_id);
        
        if (isNaN(clienteIdNum) || clienteIdNum <= 0) {
            return { error: "ID de cliente no válido." };
        }

        if (isNaN(condicionIdNum) || condicionIdNum <= 0) {
            return { error: "ID de condición de pago no válido." };
        }

        const payload = {
            cliente_id: clienteIdNum,
            condicion_id: condicionIdNum,
            usuario_id,
            detalles: carrito.map((i) => ({
                producto_id: i.id_productos,
                cantidad: i.cantidad,
                precio_unitario: i.precio_unitario,
            })),
        };

        console.log("Payload enviado:", payload);

        try {
            const res = await axios.post(`${API_URL}/api/facturas`, payload);
            setCarrito([]);
            console.log("Factura procesada exitosamente:", res.data);
            return res.data;
        } catch (err) {
            console.error("Error al procesar factura:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            return {
                error: err.response?.data?.message || err.response?.data?.error || "Error procesando factura",
            };
        }
    };

    return {
        productos,
        clientes,
        condicionesPago,
        carrito,
        loading,
        total,
        addToCart,
        changeQuantity,
        removeFromCart,
        procesarFactura,
    };
}