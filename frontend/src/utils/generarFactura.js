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
    total,
    monto_recibido,
    cambio,
    generado_por
  } = data;

  const doc = new jsPDF({
    unit: "pt",
    format: [396, 612],
  });

  doc.setFontSize(16);
  doc.text(tipo.toUpperCase(), 30, 40);

  doc.setFontSize(10);
  doc.text(`N°: ${numero_documento || ""}`, 30, 60);
  doc.text(`Fecha: ${fecha || ""}`, 30, 75);

  if (tipo === "Factura" || tipo === "Compra") {
    doc.text(`Cliente: ${cliente_nombre || ""}`, 30, 95);
    doc.text(`Condición: ${condicion_pago || ""}`, 30, 110);
  }

  let startY = tipo === "Ajuste" ? 100 : 130;

  if (detalles.length > 0) {
    if (tipo === "Ajuste") {
      autoTable(doc, {
        startY,
        head: [["Producto", "Cantidad", "Movimiento"]],
        body: detalles.map(d => [d.nombre, d.cantidad, d.movimiento]),
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
          return [d.nombre, cant, precio.toFixed(2), (cant * precio).toFixed(2)];
        }),
        theme: "grid",
        styles: { fontSize: 9 },
      });
    }
  }

  if (tipo !== "Ajuste") {
    let finalY = doc.lastAutoTable?.finalY
      ? doc.lastAutoTable.finalY + 20
      : 150;

    doc.setFontSize(12);
    doc.text(`TOTAL: RD$ ${(Number(total) || 0).toFixed(2)}`, 30, finalY);

    if (monto_recibido != null && cambio != null) {
      doc.text(`Monto recibido: RD$ ${(Number(monto_recibido) || 0).toFixed(2)}`, 30, finalY + 20);
      doc.text(`Cambio: RD$ ${(Number(cambio) || 0).toFixed(2)}`, 30, finalY + 40);
    }

    if (generado_por) {
      doc.setFontSize(9);
      doc.text(`Generado por: ${generado_por}`, 30, finalY + 60);
    }
  }

  const nombreArchivo = `${tipo}_${numero_documento || "0000"}.pdf`;
  doc.save(nombreArchivo);
}
