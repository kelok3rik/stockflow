// frontend/src/utils/exportHelper.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const generarExcel = (nombreArchivo, datosFiltrados, columnas, usuario, filtrosTexto) => {
  const fecha = new Date().toLocaleString();

  const excelData = datosFiltrados.map((item) => {
    const row = {};
    columnas.forEach((col) => {
      row[col.header] = item[col.field];
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet([]);

  XLSX.utils.sheet_add_aoa(
    ws,
    [
      [`Fecha de emisión: ${fecha}`],
      [`Generado por: ${usuario}`],
      [""],
      [`Filtros aplicados: ${filtrosTexto || "Ninguno"}`],
      [""],
    ],
    { origin: "A1" }
  );

  XLSX.utils.sheet_add_json(ws, excelData, { origin: "A6" });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), `${nombreArchivo}.xlsx`);
};

export const generarPDF = (titulo, nombreArchivo, datosFiltrados, columnas, usuario, filtrosTexto) => {
  const fecha = new Date().toLocaleString();
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(titulo, 14, 15);

  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fecha}`, 14, 23);
  doc.text(`Generado por: ${usuario}`, 14, 28);

  if (filtrosTexto) {
    doc.text(`Filtros: ${filtrosTexto}`, 14, 34);
  } else {
    doc.text("Filtros: Ninguno", 14, 34);
  }

  const head = [columnas.map((c) => c.header)];
  const body = datosFiltrados.map((item) =>
    columnas.map((c) => item[c.field])
  );

  autoTable(doc, {
    startY: 40,
    head,
    body,
  });

  doc.save(`${nombreArchivo}.pdf`);
};
