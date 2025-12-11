import { useState, useEffect } from "react";
import axios from "axios";
import { generarDocumentoPDF } from "../../utils/generarFactura";

const API_URL = import.meta.env.VITE_API_URL;

export default function usePos() {
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [condicionesPago, setCondicionesPago] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [loading, setLoading] = useState(true);

    // =======================================================
    // Normalización de datos
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

    const normalizeCliente = (c) => ({
        ...c,
        id: Number(c.id_clientes),
        id_clientes: Number(c.id_clientes),
    });

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

                setProductos(prodRes.data.map(normalizeProduct));
                setClientes(cliRes.data.map(normalizeCliente));

                const condicionesActivas = condRes.data
                    .filter(cp => cp.activo === true || cp.activo === "true")
                    .map(normalizeCondicionPago);
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
    // Carrito
    // =======================================================
    const addToCart = (producto) => {
        const existe = carrito.find(i => i.id_productos === producto.id_productos);
        if (existe) {
            setCarrito(carrito.map(i =>
                i.id_productos === producto.id_productos
                    ? { ...i, cantidad: i.cantidad + 1 }
                    : i
            ));
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1, precio_unitario: producto.precio_venta, nombre: producto.nombre }]);
        }
    };

    const changeQuantity = (id, cantidad) => {
        if (cantidad <= 0) return;
        setCarrito(carrito.map(i => i.id_productos === id ? { ...i, cantidad } : i));
    };

    const removeFromCart = (id) => {
        setCarrito(carrito.filter(i => i.id_productos !== id));
    };

    const total = carrito.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0);

    // =======================================================
    // Procesar factura y generar PDF automático
    // =======================================================
    const procesarFactura = async (cliente_id, condicion_pago_id, monto_recibido, cambio, usuario_id = 1) => {
        if (!cliente_id) return { error: "Debe seleccionar un cliente." };
        if (!condicion_pago_id) return { error: "Debe seleccionar una condición de pago." };
        if (carrito.length === 0) return { error: "Debe agregar productos." };

        const clienteIdNum = Number(cliente_id);
        const condicionIdNum = Number(condicion_pago_id);

        const condicion = condicionesPago.find(cp => cp.id === condicionIdNum);
        const esContado = condicion?.dias_plazo === 0;

        if (esContado) {
            const recibido = Number(monto_recibido);
            if (isNaN(recibido) || recibido < total) {
                return { error: "El monto recibido es menor que el total." };
            }
        }

        const payload = {
            cliente_id: clienteIdNum,
            condicion_id: condicionIdNum,
            usuario_id,
            total,
            detalles: carrito.map(i => ({
                producto_id: i.id_productos,
                cantidad: i.cantidad,
                precio_unitario: i.precio_unitario,
                nombre: i.nombre
            })),
        };

        if (esContado) {
            payload.monto_recibido = Number(monto_recibido);
            payload.cambio = Number(cambio);
        }

        try {
            const res = await axios.post(`${API_URL}/api/facturas`, payload);
            const respuesta = res.data;

            // Construir JSON para el PDF
            const cliente = clientes.find(c => c.id === clienteIdNum);
            const facturaPDF = {
                tipo: "Factura",
                numero_documento: respuesta.numero_documento,
                fecha: new Date().toLocaleString(),
                cliente_nombre: cliente?.nombre || "Consumidor Final",
                condicion_pago: condicion?.nombre || "",
                detalles: carrito.map(item => ({
                    nombre: item.nombre,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                })),
                total,
                monto_recibido: esContado ? Number(monto_recibido) : null,
                cambio: esContado ? Number(cambio) : 0,
            };

            // GENERAR PDF AUTOMÁTICO
            generarDocumentoPDF(facturaPDF);

            setCarrito([]);
            return respuesta;

        } catch (err) {
            console.error("Error al procesar factura:", err.response?.data);
            return { error: err.response?.data?.message || "Error procesando factura" };
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
