import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    generado_por
  } = data;

  const doc = new jsPDF({
    unit: "pt",
    format: [396, 612],
  });

  /* ================= HEADER ================= */
  doc.setFontSize(16);
  doc.text(tipo.toUpperCase(), 30, 40);

  doc.setFontSize(10);
  doc.text(`N°: ${numero_documento ?? "N/D"}`, 30, 60);
  doc.text(`Fecha: ${fecha ?? ""}`, 30, 75);

  if (tipo === "Factura" || tipo === "Compra") {
    doc.text(`Cliente: ${cliente_nombre ?? ""}`, 30, 95);
    doc.text(`Condición: ${condicion_pago ?? ""}`, 30, 110);
  }

  let startY = tipo === "Ajuste" ? 100 : 130;

  /* ================= DETALLE ================= */
  if (detalles.length > 0) {
    if (tipo === "Ajuste") {
      autoTable(doc, {
        startY,
        head: [["Producto", "Cantidad", "Movimiento"]],
        body: detalles.map(d => [
          d.nombre || "Producto",
          Number(d.cantidad) || 0,
          d.movimiento || ""
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
    } else {
      autoTable(doc, {
        startY,
        head: [["Producto", "Cant", "Precio", "Subtotal"]],
        body: detalles.map(d => {
          const cant = Number(d.cantidad) || 0;
          const precio = Number(d.precio_unitario) || 0;
          return [
            d.producto || d.nombre || "Producto",
            cant,
            precio.toFixed(2),
            (cant * precio).toFixed(2)
          ];
        }),
        theme: "grid",
        styles: { fontSize: 9 },
      });
    }
  }

  /* ================= TOTALES ================= */
  if (tipo !== "Ajuste") {
    const finalY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 20
      : startY + 20;

    doc.setFontSize(12);
    doc.text(`TOTAL: RD$ ${Number(total).toFixed(2)}`, 30, finalY);

    doc.setFontSize(10);
    doc.text(`Monto recibido: RD$ ${Number(monto_recibido).toFixed(2)}`, 30, finalY + 20);
    doc.text(`Cambio: RD$ ${Number(cambio).toFixed(2)}`, 30, finalY + 40);

    if (generado_por) {
      doc.setFontSize(9);
      doc.text(`Generado por: ${generado_por}`, 30, finalY + 60);
    }
  }

  /* ================= GUARDAR ================= */
  const nombreArchivo = `${tipo}_${numero_documento ?? "0000"}.pdf`;
  doc.save(nombreArchivo);
}
