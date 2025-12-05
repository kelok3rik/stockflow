import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Typography } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

export default function CotizacionTable({ data, onEdit, onDelete }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedDetalles, setSelectedDetalles] = useState([]);
  const [selectedTotal, setSelectedTotal] = useState(0);

  const handleVerDetalles = (detalles, total) => {
    setSelectedDetalles(detalles || []);
    setSelectedTotal(parseFloat(total) || 0);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDetalles([]);
    setSelectedTotal(0);
  };

  // Convertimos los datos correctamente para DataGrid
  const rows = data.map(item => ({
    ...item,
    id: item.id_cotizaciones,
    total: parseFloat(item.total),
    fecha: new Date(item.fecha)
  }));

  const columns = [
    { field: "id_cotizaciones", headerName: "ID", width: 100 },
    { 
      field: "fecha", 
      headerName: "Fecha", 
      width: 130,
      valueFormatter: (params) =>
        params.value instanceof Date ? params.value.toLocaleDateString() : ""
    },
    { field: "cliente", headerName: "Cliente", width: 200 },
    { 
      field: "total", 
      headerName: "Total", 
      width: 130,
      valueFormatter: (params) =>
        `RD$ ${params.value?.toFixed(2) || "0.00"}`
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 250,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleVerDetalles(params.row.detalles, params.row.total)} 
            style={{ marginRight: 8 }}
          >
            Ver Detalles
          </Button>
          <IconButton color="primary" onClick={() => onEdit(params.row)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(params.row.id_cotizaciones)}>
            <Delete />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <>
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de la Cotización</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Precio Unitario</TableCell>
                <TableCell>Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedDetalles.map((item) => (
                <TableRow key={item.id_cotizacion_detalle}>
                  <TableCell>{item.producto}</TableCell>
                  <TableCell>{parseFloat(item.cantidad)}</TableCell>
                  <TableCell>RD$ {parseFloat(item.precio_unitario).toFixed(2)}</TableCell>
                  <TableCell>RD$ {parseFloat(item.subtotal).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} style={{ fontWeight: "bold", textAlign: "right" }}>
                  Total:
                </TableCell>
                <TableCell style={{ fontWeight: "bold" }}>
                  RD$ {selectedTotal.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
}
