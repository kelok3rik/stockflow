import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * data: {
 *   tipo: "Ajuste",
 *   numero_documento: string,
 *   fecha: string,
 *   usuario: string,
 *   detalles: [{ nombre, cantidad, movimiento }]
 * }
 */
export function generarMovimientoPDF(data) {
  const { tipo = "Documento", numero_documento, fecha, usuario, detalles = [] } = data;

  const doc = new jsPDF({ unit: "pt", format: [396, 612] });

  doc.setFontSize(16);
  doc.text(tipo.toUpperCase(), 30, 40);

  doc.setFontSize(10);
  doc.text(`N°: ${numero_documento || ""}`, 30, 60);
  doc.text(`Fecha: ${fecha || ""}`, 30, 75);
  doc.text(`Usuario: ${usuario || ""}`, 30, 90);

  if (detalles.length > 0) {
    autoTable(doc, {
      startY: 110,
      head: [["Producto", "Cantidad", "Movimiento"]],
      body: detalles.map(item => [
        item.nombre || "N/D",
        item.cantidad,
        item.movimiento
      ]),
      theme: "grid",
      styles: { fontSize: 9 }
    });
  }

  const nombreArchivo = `${tipo}_${numero_documento || "0000"}.pdf`;
  doc.save(nombreArchivo);
}
