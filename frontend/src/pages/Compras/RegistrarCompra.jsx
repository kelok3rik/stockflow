import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Paper,
  TablePagination,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import useCompras from "./useCompras";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { generarDocumentoPDF } from "../../utils/generarFactura";

export default function RegistrarCompra() {
  const { user } = useAuth();
  const { createCompra, loading } = useCompras(user?.id);

  const [proveedorId, setProveedorId] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/proveedores`)
      .then(res => setProveedores(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProveedores([]));

    axios.get(`${import.meta.env.VITE_API_URL}/api/productos`)
      .then(res => setProductos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setProductos([]));
  }, []);

  const agregarFila = () => {
    setDetalles([...detalles, { producto_id: "", cantidad: 1, costo_unitario: 0, nombre: "" }]);
  };

  const actualizarDetalle = (index, campo, valor) => {
    const copia = [...detalles];
    if (campo === "producto_id") {
      const producto = productos.find(p => p.id_productos === valor);
      copia[index].producto_id = valor;
      copia[index].costo_unitario = producto ? Number(producto.costo) : 0;
      copia[index].nombre = producto ? producto.nombre : "";
    } else {
      copia[index][campo] = valor;
    }
    setDetalles(copia);
  };

  const eliminarDetalle = index => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const calcularSubtotal = (cantidad, costo_unitario) => cantidad * costo_unitario;
  const totalGeneral = detalles.reduce(
    (acc, d) => acc + calcularSubtotal(Number(d.cantidad), Number(d.costo_unitario)),
    0
  );

  const enviarCompra = async () => {
    if (!proveedorId || detalles.length === 0) {
      alert("Seleccione un proveedor y agregue al menos un producto.");
      return;
    }

    for (let d of detalles) {
      if (!d.producto_id || d.cantidad <= 0) {
        alert("Revise los productos: cantidad debe ser mayor que 0.");
        return;
      }
    }

    try {
      const body = {
        proveedor_id: Number(proveedorId),
        usuario_id: user?.id_usuarios || null,
        detalles: detalles.map(d => ({
          producto_id: Number(d.producto_id),
          cantidad: Number(d.cantidad),
          costo_unitario: Number(d.costo_unitario),
          nombre: d.nombre
        }))
      };

      const response = await createCompra(body);
      alert(`Compra registrada. ID: ${response.compra_id}`);

      generarDocumentoPDF({
        tipo: "Compra",
        numero_documento: response.numero_documento,
        fecha: new Date().toLocaleDateString(),
        cliente_nombre: proveedores.find(p => p.id_proveedores === proveedorId)?.nombre || "Proveedor",
        condicion_pago: "Credito",
        detalles: body.detalles,
        total: totalGeneral,
        monto_recibido: null,
        cambio: null
      });

      setProveedorId("");
      setDetalles([]);
      setPage(0);
    } catch (err) {
      alert(err.message || "Error al registrar compra");
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3, color: "#1976d2" }}>
        Registrar Compra
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, color: "#424242" }}>
          Selección de Proveedor
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Proveedor"
              fullWidth
              value={proveedorId}
              onChange={e => setProveedorId(e.target.value)}
              sx={{ minWidth: 250 }}
            >
              <MenuItem value="" disabled>
                Seleccione un proveedor
              </MenuItem>
              {proveedores.map(p => (
                <MenuItem key={p.id_proveedores} value={p.id_proveedores}>
                  {p.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: "#424242" }}>Detalles de Compra</Typography>
          <Button variant="contained" onClick={agregarFila}>
            Agregar Producto
          </Button>
        </Box>

        <Table size="small" sx={{ minWidth: 350 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Costo Unitario</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Cantidad</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subtotal</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((fila, index) => {
                const subtotal = calcularSubtotal(Number(fila.cantidad), Number(fila.costo_unitario));
                return (
                  <TableRow key={index} hover>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={fila.producto_id}
                        onChange={e => actualizarDetalle(index, "producto_id", e.target.value)}
                        size="small"
                      >
                        <MenuItem value="" disabled>
                          Seleccione un producto
                        </MenuItem>
                        {productos.map(p => (
                          <MenuItem key={p.id_productos} value={p.id_productos}>
                            {p.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={fila.costo_unitario}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={fila.cantidad}
                        onChange={e => actualizarDetalle(index, "cantidad", e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{subtotal.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => eliminarDetalle(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={detalles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ mb: 1, color: "#424242" }}>Resumen</Typography>
        <Divider sx={{ mb: 1 }} />
        <Typography>Total: RD$ {totalGeneral.toFixed(2)}</Typography>
        <Typography>Saldo: RD$ {totalGeneral.toFixed(2)}</Typography>
      </Paper>

      <Box textAlign="right">
        <Button
          variant="contained"
          color="primary"
          onClick={enviarCompra}
          disabled={loading || detalles.length === 0 || !user}
          sx={{ px: 4, py: 1.5 }}
        >
          {loading ? "Guardando..." : "Registrar Compra"}
        </Button>
      </Box>
    </Box>
  );
}
