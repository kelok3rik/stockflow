import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateFacturaPDF = async (factura, detalles) => {
  const fileName = `factura_${factura.numero_documento}.pdf`;
  const filePath = path.join("/usr/src/app/temp", fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [396, 612], // Media carta (8.5" x 5.5") en puntos
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // -------------------------------
    // ENCABEZADO
    // -------------------------------
    doc
      .fontSize(20)
      .text("FACTURA", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Factura No.: ${factura.numero_documento}`)
      .text(`Fecha: ${factura.fecha}`)
      .text(`Cliente: ${factura.cliente_nombre}`)
      .text(`Condición: ${factura.condicion_nombre}`)
      .moveDown(1);

    // -------------------------------
    // TABLA DE PRODUCTOS
    // -------------------------------
    doc.fontSize(12).text("Detalles:", { underline: true }).moveDown(0.5);

    doc.font("Helvetica-Bold");
    doc.text("Producto       Cant   Precio   Total");
    doc.font("Helvetica");
    doc.moveDown(0.4);

    detalles.forEach((d) => {
      const total = (d.cantidad * d.precio_unitario).toFixed(2);

      doc.text(
        `${d.producto_nombre.substring(0, 12).padEnd(13)}  ${String(
          d.cantidad
        ).padEnd(5)} RD$ ${String(d.precio_unitario).padEnd(
          7
        )} RD$ ${total}`
      );
    });

    doc.moveDown(1);

    // -------------------------------
    // TOTALES
    // -------------------------------
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`Total: RD$ ${factura.total}`, { align: "right" });

    if (factura.estado === "PAGADA") {
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Monto Recibido: RD$ ${factura.monto_recibido}`, {
          align: "right",
        })
        .text(`Cambio: RD$ ${factura.cambio}`, {
          align: "right",
        });
    } else {
      doc
        .font("Helvetica")
        .fontSize(12)
        .text(`Saldo pendiente:  ${factura.saldo}`, {
          align: "right",
        });
    }

    doc.moveDown(2);

    doc.fontSize(10).text("Gracias por su compra.", { align: "center" });

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};
