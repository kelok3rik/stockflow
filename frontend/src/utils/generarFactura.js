// frontend/src/utils/generarFactura.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * data: {
 *   tipo: "Factura" | "Compra" | "Ticket",
 *   numero_documento,
 *   fecha,
 *   cliente_nombre,
 *   condicion_pago,
 *   detalles: [{ nombre, cantidad, precio_unitario }],
 *   total,
 *   monto_recibido,
 *   cambio
 * }
 */
export function generarDocumentoPDF(data) {
  const {
    tipo = "Documento",
    numero_documento,
    fecha,
    cliente_nombre,
    condicion_pago,
    detalles = [],
    total = 0,
    monto_recibido = 0,
    cambio = 0,
  } = data;

  // Media carta → 5.5 x 8.5 pulgadas
  const doc = new jsPDF({
    unit: "pt",
    format: [396, 612], // media carta
  });

  // ====== ENCABEZADO ======
  doc.setFontSize(16);
  doc.text(tipo.toUpperCase(), 30, 40);

  doc.setFontSize(10);
  doc.text(`N°: ${numero_documento || ""}`, 30, 60);
  doc.text(`Fecha: ${fecha || ""}`, 30, 75);

  if (tipo === "Factura" || tipo === "Compra") {
    doc.text(`Cliente: ${cliente_nombre || ""}`, 30, 95);
    doc.text(`Condición: ${condicion_pago || ""}`, 30, 110);
  }

  // ====== TABLA DE PRODUCTOS ======
  if (detalles.length > 0) {
    autoTable(doc, {
      startY: 130,
      head: [["Producto", "Cant", "Precio", "Subtotal"]],
      body: detalles.map((item) => {
        const cantidad = Number(item.cantidad) || 0;
        const precio = Number(item.precio_unitario) || 0;
        return [
          item.nombre || "",
          cantidad,
          precio.toFixed(2),
          (cantidad * precio).toFixed(2),
        ];
      }),
      theme: "grid",
      styles: { fontSize: 9 },
    });
  }

  // ====== TOTAL ======
  let finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 150;
  doc.setFontSize(12);
  doc.text(`TOTAL: RD$ ${(Number(total) || 0).toFixed(2)}`, 30, finalY);

  if (monto_recibido != null && cambio != null) {
    doc.text(`Monto recibido: RD$ ${(Number(monto_recibido) || 0).toFixed(2)}`, 30, finalY + 20);
    doc.text(`Cambio: RD$ ${(Number(cambio) || 0).toFixed(2)}`, 30, finalY + 40);
  }

  // ====== DESCARGAR ======
  const nombreArchivo = `${tipo}_${numero_documento || "0000"}.pdf`;
  doc.save(nombreArchivo);
}
