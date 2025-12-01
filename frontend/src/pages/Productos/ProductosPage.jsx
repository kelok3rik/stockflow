// src/pages/productos/ProductosPage.jsx
import {
  Button,
  Typography,
  Box,
  TableContainer,
  Paper,
  TablePagination,
  TextField,
} from "@mui/material";
import { useState } from "react";
import ProductosTable from "./ProductosTable";
import ProductoFormModal from "./ProductoFormModal";
import useProductos from "./useProductos";

export default function ProductosPage() {
  const { productos, createProducto, updateProducto } = useProductos();

  const [open, setOpen] = useState(false);
  const [productoEdit, setProductoEdit] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = () => {
    setProductoEdit(null);
    setOpen(true);
  };

  // MAPEAR RESPUESTA API
  const listaProductos = (productos || []).map(p => ({
    id: p.id_productos,
    codigo: p.sku,
    nombre: p.nombre,
    costo: p.costo,
    precio: p.precio_venta,
    unidad: p.unidad,
    stock: p.stock,
    stock_min: p.stock_min,
    activo: p.activo,

    departamento_id: p.departamento_id,
    grupo_id: p.grupo_id,
    ubicacion_id: p.ubicacion_id,
  }));

  // ✅ FILTRO DE BÚSQUEDA
  const productosFiltrados = listaProductos.filter(p => {
    const txt = busqueda.toLowerCase();
    return (
      p.codigo?.toLowerCase().includes(txt) ||
      p.nombre?.toLowerCase().includes(txt) ||
      p.unidad?.toLowerCase().includes(txt)
    );
  });

  // ✅ PAGINACIÓN SOBRE RESULTADO FILTRADO
  const productosPagina = productosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box p={3}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Productos</Typography>
        <Button variant="contained" onClick={handleOpen}>
          Nuevo Producto
        </Button>
      </Box>

      {/* ✅ BUSCADOR */}
      <Box mb={2}>
        <TextField
          label="Buscar por código, nombre o unidad"
          variant="outlined"
          size="small"
          fullWidth
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPage(0); // volver a la primera página al filtrar
          }}
        />
      </Box>

      {/* TABLA */}
      <TableContainer component={Paper}>
        <ProductosTable
          productos={productosPagina}
          onEdit={(p) => {
            const safe = {
              ...p,
              departamento_id: String(p.departamento_id ?? ""),
              grupo_id: String(p.grupo_id ?? ""),
              ubicacion_id: String(p.ubicacion_id ?? ""),
            };

            setProductoEdit(safe);
            setOpen(true);
          }}
        />
      </TableContainer>

      {/* PAGINACIÓN */}
      <TablePagination
        component="div"
        count={productosFiltrados.length}
        page={page}
        onPageChange={(e, n) => setPage(n)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* MODAL */}
      <ProductoFormModal
        open={open}
        onClose={() => setOpen(false)}
        producto={productoEdit}
        onSave={productoEdit
          ? (data) => updateProducto(productoEdit.id, data)
          : createProducto
        }
      />
    </Box>
  );
}
