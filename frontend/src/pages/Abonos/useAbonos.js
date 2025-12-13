import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

export const useAbonos = () => {
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // objeto completo
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // -------------------------------
    // Cargar clientes
    // -------------------------------
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/clientes`);
                console.log("Clientes recibidos:", data);

                const clientesArray = Array.isArray(data)
                    ? data
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

                setClientes(
                    clientesArray.map(c => ({
                        ...c,
                        id_clientes: Number(c.id_clientes)
                    }))
                );
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };
        fetchClientes();
    }, []);

    // -------------------------------
    // Cargar facturas pendientes del cliente
    // -------------------------------
    useEffect(() => {
        if (!clienteSeleccionado) return;

        const fetchFacturas = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(
                    `${API_URL}/api/facturas/pendientes/${clienteSeleccionado.id_clientes}`
                );
                console.log("Facturas recibidas:", data);

                const facturasArray = Array.isArray(data)
                    ? data
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

                setFacturas(
                    facturasArray.map(f => ({
                        ...f,
                        abono: 0,
                        total: Number(f.total),
                        saldo: Number(f.saldo),
                    }))
                );
            } catch (err) {
                console.error(err);
                setError(err.message);
                setFacturas([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFacturas();
    }, [clienteSeleccionado]);

    // -------------------------------
    // Cambiar cliente
    // -------------------------------
    const seleccionarCliente = id => {
        const clienteObj = clientes.find(c => c.id_clientes === Number(id));
        setClienteSeleccionado(clienteObj || null);
    };

    // -------------------------------
    // Cambiar abono en input
    // -------------------------------
    const setAbonoFactura = (id_facturas, abono) => {
        const num = Number(abono);
        setFacturas(prev =>
            prev.map(f =>
                f.id_facturas === id_facturas
                    ? { ...f, abono: isNaN(num) ? 0 : num }
                    : f
            )
        );
    };

    // -------------------------------
    // Función para generar comprobante PDF
    // -------------------------------
    const generarComprobantePago = ({ numeroDocumento, cliente, factura, monto, fecha, metodo_pago }) => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("COMPROBANTE DE PAGO", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.text(`Número de pago: ${numeroDocumento}`, 20, 40);
        doc.text(`Fecha: ${new Date(fecha).toLocaleString()}`, 20, 50);
        doc.text(`Cliente: ${cliente}`, 20, 60);
        doc.text(`Factura: ${factura}`, 20, 70);
        doc.text(`Método de pago: ${metodo_pago}`, 20, 80);
        doc.text(`Monto abonado: $${monto.toFixed(2)}`, 20, 90);

        autoTable(doc, {
            startY: 110,
            head: [["Concepto", "Monto"]],
            body: [["Abono a factura", `$${monto.toFixed(2)}`]],
        });

        doc.setFontSize(10);
        doc.text("Gracias por su pago.", 105, doc.internal.pageSize.getHeight() - 20, { align: "center" });

        doc.save(`Pago-${numeroDocumento}.pdf`);
    };

    // -------------------------------
    // Registrar abono
    // -------------------------------
    const abonarFactura = async (factura, nombreCliente) => {
        if (!factura.abono || factura.abono <= 0) return;

        if (factura.abono > factura.saldo) {
            alert("El abono no puede exceder el saldo pendiente");
            return;
        }

        try {
            const { data } = await axios.post(`${API_URL}/api/facturas/abonar`, {
                id_factura: factura.id_facturas,
                abono: factura.abono,
                usuario_id: 1,
                metodo_pago: "EFECTIVO"
            });

            // Actualizar saldo local
            setFacturas(prev =>
                prev.map(f =>
                    f.id_facturas === factura.id_facturas
                        ? {
                            ...f,
                            saldo: Number(data.nuevoSaldo),
                            estado: data.nuevoEstado,
                            abono: 0
                        }
                        : f
                )
            );

            // Generar PDF usando el nombre del cliente pasado como argumento
            generarComprobantePago({
                numeroDocumento: data.numeroDocumento,
                cliente: nombreCliente || "Cliente",
                factura: factura.numero_documento,
                monto: factura.abono,
                fecha: new Date(),
                metodo_pago: "EFECTIVO"
            });

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || err.message);
        }
    };


    return {
        clientes,
        clienteSeleccionado,
        seleccionarCliente,
        facturas,
        loading,
        error,
        setAbonoFactura,
        abonarFactura
    };
};
