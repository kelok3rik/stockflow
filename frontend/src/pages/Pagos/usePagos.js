import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

export const usePagos = () => {
  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -------------------------------
  // Cargar proveedores
  // -------------------------------
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/proveedores`);
        const proveedoresArray = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];
        setProveedores(
          proveedoresArray.map(p => ({
            ...p,
            id_proveedores: Number(p.id_proveedores)
          }))
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchProveedores();
  }, []);

  // -------------------------------
  // Cargar compras pendientes
  // -------------------------------
  useEffect(() => {
    if (!proveedorSeleccionado) return;

    const fetchCompras = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/api/compras/pendientes/${proveedorSeleccionado}`
        );

        const comprasArray = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        setCompras(
          comprasArray.map(c => ({
            ...c,
            abono: 0,
            total: Number(c.total),
            saldo: Number(c.saldo),
            proveedor_nombre: c.proveedor_nombre || "Desconocido" // <--- aquí
          }))
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
        setCompras([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, [proveedorSeleccionado]);

  // -------------------------------
  // Cambiar proveedor
  // -------------------------------
  const seleccionarProveedor = id => {
    setProveedorSeleccionado(Number(id));
  };

  // -------------------------------
  // Cambiar abono en input
  // -------------------------------
  const setAbonoCompra = (id_compra, abono) => {
    const num = Number(abono);
    setCompras(prev =>
      prev.map(c =>
        c.id_compras === id_compra
          ? { ...c, abono: isNaN(num) ? 0 : num }
          : c
      )
    );
  };

  // -------------------------------
  // Generar PDF del comprobante
  // -------------------------------
  const generarPDF = (compra, numeroDocumento) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Comprobante de Pago de Compra", 105, 15, null, null, "center");

    doc.setFontSize(12);
    doc.text(`Número de pago: ${numeroDocumento}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Proveedor: ${compra.proveedor_nombre}`, 14, 46);
    doc.text(`Compra: ${compra.id_compras}`, 14, 54);
    doc.text(`Método de pago: EFECTIVO`, 14, 62);
    doc.text(`Monto pagado: $${compra.abono.toFixed(2)}`, 14, 70);

    // Detalle
    autoTable(doc, {
      startY: 80,
      head: [["Concepto", "Monto"]],
      body: [[`Pago a la compra ${compra.id_compras}`, `$${compra.abono.toFixed(2)}`]],
      theme: "grid"
    });

    // Descargar PDF
    doc.save(`Pago_Compra_${numeroDocumento}.pdf`);
  };

  // -------------------------------
  // Registrar pago
  // -------------------------------
  const pagarCompra = async compra => {
    if (!compra.abono || compra.abono <= 0) return;

    if (compra.abono > compra.saldo) {
      alert("El pago no puede exceder el saldo pendiente");
      return;
    }

    try {
      // ✅ URL corregida para enviar id_compra en la ruta
      const { data } = await axios.post(
        `${API_URL}/api/compras/${compra.id_compras}/pagar`,
        {
          abono: compra.abono,
          usuario_id: 1, // reemplaza con el usuario logueado
          metodo_pago: "EFECTIVO"
        }
      );

      // Actualizar saldo local
      setCompras(prev =>
        prev.map(c =>
          c.id_compras === compra.id_compras
            ? {
                ...c,
                saldo: Number(data.nuevoSaldo),
                estado: data.nuevoEstado,
                abono: 0
              }
            : c
        )
      );

      // Generar PDF del comprobante
      generarPDF({ ...compra, abono: compra.abono }, data.numeroDocumento);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
    }
  };

  return {
    proveedores,
    proveedorSeleccionado,
    seleccionarProveedor,
    compras,
    loading,
    error,
    setAbonoCompra,
    pagarCompra
  };
};
