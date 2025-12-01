// src/pages/productos/ProductoFormModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProductoFormModal({ open, onClose, onSave, producto }) {

  const API_URL = import.meta.env.VITE_API_URL;

  const emptyForm = {
    sku: "",
    nombre: "",
    departamento_id: "",
    grupo_id: "",
    ubicacion_id: "",
    unidad: "",
    precio_venta: "",
    costo: "",
    stock: "",
    stock_min: "",
    activo: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [departamentos, setDepartamentos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Cargar selects
  useEffect(() => {
    if (!open) return;

    Promise.all([
      axios.get(`${API_URL}/api/departamentos`),
      axios.get(`${API_URL}/api/grupos`),
      axios.get(`${API_URL}/api/ubicaciones`),
    ]).then(([d, g, u]) => {
      setDepartamentos(d.data || []);
      setGrupos(g.data || []);
      setUbicaciones(u.data || []);
    });
  }, [open]);

  // Cargar producto si edita
  useEffect(() => {
    if (producto) {
      setForm({
        sku: producto.codigo || "",
        nombre: producto.nombre || "",
        departamento_id: String(producto.departamento_id || ""),
        grupo_id: String(producto.grupo_id || ""),
        ubicacion_id: String(producto.ubicacion_id || ""),
        unidad: producto.unidad || "",
        precio_venta: producto.precio || "",
        costo: producto.costo || "",
        stock: producto.stock || "",
        stock_min: producto.stock_min || "",
        activo: producto.activo ?? true,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [producto, open]);

  // Validaciones
  const validate = () => {
    const e = {};

    if (!form.nombre) e.nombre = "Nombre obligatorio";
    if (form.nombre.length > 100) e.nombre = "Máximo 100 caracteres";

    if (form.sku.length > 30) e.sku = "Máximo 30 caracteres";
    if (form.unidad.length > 20) e.unidad = "Máximo 20 caracteres";

    if (!form.departamento_id) e.departamento_id = "Seleccione un departamento";
    if (!form.grupo_id) e.grupo_id = "Seleccione un grupo";

    if (!form.precio_venta || Number(form.precio_venta) <= 0)
      e.precio_venta = "Debe ser mayor a 0";

    if (!form.costo || Number(form.costo) <= 0)
      e.costo = "Debe ser mayor a 0";

    if (Number(form.stock) < 0) e.stock = "No puede ser negativo";
    if (Number(form.stock_min) < 0) e.stock_min = "No puede ser negativo";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Guardar
  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({
        open: true,
        msg: "Revisa los errores del formulario",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      await onSave({
        ...form,
        departamento_id: Number(form.departamento_id),
        grupo_id: Number(form.grupo_id),
        ubicacion_id: Number(form.ubicacion_id),
        activo: Boolean(form.activo),
      });

      setSnackbar({
        open: true,
        msg: producto ? "Producto actualizado" : "Producto creado",
        severity: "success",
      });

      onClose();

    } catch (err) {
      setSnackbar({
        open: true,
        msg: err.response?.data?.error || "Error al guardar",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{producto ? "Editar" : "Nuevo"} Producto</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} direction="column">

            {/* CAMPOS */}
            {[
              ["SKU", "sku"],
              ["Nombre", "nombre"],
              ["Unidad", "unidad"],
              ["Costo", "costo"],
              ["Precio Venta", "precio_venta"],
              ["Stock", "stock"],
              ["Stock Mínimo", "stock_min"],
            ].map(([label, name]) => (
              <Grid item key={name}>
                <TextField
                  fullWidth
                  size="small"
                  label={label}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  error={!!errors[name]}
                  helperText={errors[name]}
                  type={["costo", "precio_venta", "stock", "stock_min"].includes(name) ? "number" : "text"}
                />
              </Grid>
            ))}

            {/* SELECTS */}
            {[
              ["Departamento", "departamento_id", departamentos],
              ["Grupo", "grupo_id", grupos],
              ["Ubicación", "ubicacion_id", ubicaciones],
            ].map(([label, name, data]) => (
              <Grid item key={name}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label={label}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  error={!!errors[name]}
                  helperText={errors[name]}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {data.map(d => (
                    <MenuItem
                      key={d.id_departamentos || d.id_grupos || d.id_ubicaciones}
                      value={String(d.id_departamentos || d.id_grupos || d.id_ubicaciones)}
                    >
                      {d.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}

            {/* ESTADO */}
            <Grid item>
              <TextField
                select
                size="small"
                fullWidth
                label="Estado"
                value={form.activo ? "1" : "0"}
                onChange={(e) => setForm(p => ({ ...p, activo: e.target.value === "1" }))}
              >
                <MenuItem value="1">Activo</MenuItem>
                <MenuItem value="0">Inactivo</MenuItem>
              </TextField>
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
