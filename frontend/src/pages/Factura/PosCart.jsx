// frontend/src/pages/Factura/PosCart.jsx
import {
  Paper,
  Typography,
  IconButton,
  TextField,
  Box,
  Divider,
  Chip,
  Stack,
  Tooltip,
  Badge,
  Button,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Payment as PaymentIcon
} from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";

export default function PosCart({
  carrito = [],
  clientes = [],
  condicionesPago = [],
  clienteSeleccionado,
  condicionPagoSeleccionada,
  onClienteChange,
  onCondicionPagoChange,
  removeFromCart,
  changeQuantity,
  total = 0,
  procesando = false,
  onProcesarFactura
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Local select values (strings for MUI Select)
  const [clienteSelectValue, setClienteSelectValue] = useState(
    clienteSeleccionado ? clienteSeleccionado.toString() : ""
  );
  const [condicionSelectValue, setCondicionSelectValue] = useState(
    condicionPagoSeleccionada ? condicionPagoSeleccionada.toString() : ""
  );

  // Monto recibido (solo para contado)
  const [montoRecibido, setMontoRecibido] = useState("");

  // Sync when parent changes selection externally
  useEffect(() => {
    setClienteSelectValue(clienteSeleccionado ? clienteSeleccionado.toString() : "");
  }, [clienteSeleccionado]);

  useEffect(() => {
    setCondicionSelectValue(condicionPagoSeleccionada ? condicionPagoSeleccionada.toString() : "");
    // reset monto recibido when condition changes
    setMontoRecibido("");
  }, [condicionPagoSeleccionada]);

  // Helpers to find client/condition objects
  const clienteObj = clientes.find((c) => String(c.id) === String(clienteSeleccionado));
  const condicionObj = condicionesPago.find((cp) => String(cp.id) === String(condicionPagoSeleccionada));

  const clienteNombre = clienteObj?.nombre || "No seleccionado";
  const condicionNombre = condicionObj?.nombre || "No seleccionada";
  const diasPlazo = condicionObj?.dias_plazo ?? 0;

  // Es contado si dias_plazo == 0 OR si el nombre incluye 'contado' (por compatibilidad)
  const esContado = useMemo(() => {
    if (!condicionObj) return false;
    const byDias = Number(condicionObj.dias_plazo) === 0;
    const byName = String(condicionObj.nombre).toLowerCase().includes("contado");
    return byDias || byName;
  }, [condicionObj]);

  const cambio = useMemo(() => {
    if (!esContado) return 0;
    const recibido = Number(montoRecibido) || 0;
    return recibido - Number(total || 0);
  }, [montoRecibido, total, esContado]);

  // Handlers
  const handleClienteChange = (event) => {
    const value = event.target.value;
    setClienteSelectValue(value);
    if (value === "") {
      onClienteChange && onClienteChange(null);
    } else {
      const clienteId = Number(value);
      if (!isNaN(clienteId)) onClienteChange && onClienteChange(clienteId);
    }
  };

  const handleCondicionPagoChange = (event) => {
    const value = event.target.value;
    setCondicionSelectValue(value);
    if (value === "") {
      onCondicionPagoChange && onCondicionPagoChange(null);
    } else {
      const condicionId = Number(value);
      if (!isNaN(condicionId)) onCondicionPagoChange && onCondicionPagoChange(condicionId);
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    const q = Number(newQuantity) || 0;
    if (q >= 1 && q <= 999) {
      changeQuantity && changeQuantity(id, q);
    }
  };

  const handleIncrement = (item) => handleQuantityChange(item.id_productos, item.cantidad + 1);
  const handleDecrement = (item) => {
    if (item.cantidad > 1) handleQuantityChange(item.id_productos, item.cantidad - 1);
  };

  const getItemSubtotal = (item) => (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);

  const handleProcesar = () => {
    // Validaciones extra antes de enviar al padre
    if (!clienteSeleccionado) return;
    if (!condicionPagoSeleccionada) return;
    if (esContado) {
      const recibido = Number(montoRecibido) || 0;
      if (recibido < Number(total || 0)) return;
    }

    // Llamada al padre con monto y cambio
    onProcesarFactura &&
      onProcesarFactura(
        clienteSeleccionado,
        condicionPagoSeleccionada,
        esContado ? Number(montoRecibido) : 0,
        esContado ? Number(cambio) : 0
      );
  };

  // Evita crash si arrays vienen undefined
  const items = Array.isArray(carrito) ? carrito : [];

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper"
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: "primary.main", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptIcon />
          <Typography variant="h6" fontWeight="bold">Resumen de Compra</Typography>
        </Box>
        <Badge badgeContent={items.length} color="secondary" sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem', height: '22px', minWidth: '22px', fontWeight: 'bold' } }}>
          <CartIcon />
        </Badge>
      </Box>

      {/* Selectores de cliente y condición de pago */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "background.default", flexShrink: 0 }}>
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon fontSize="small" /> Cliente
              </Box>
            </InputLabel>
            <Select
              value={clienteSelectValue}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon fontSize="small" /> Cliente
                </Box>
              }
              onChange={handleClienteChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="">
                <em>Seleccionar cliente</em>
              </MenuItem>
              {clientes.map((cliente) => (
                <MenuItem key={cliente.id} value={cliente.id.toString()}>
                  {cliente.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PaymentIcon fontSize="small" /> Condición de Pago
              </Box>
            </InputLabel>
            <Select
              value={condicionSelectValue}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PaymentIcon fontSize="small" /> Condición de Pago
                </Box>
              }
              onChange={handleCondicionPagoChange}
              displayEmpty
              size="small"
            >
              <MenuItem value="">
                <em>Seleccionar condición</em>
              </MenuItem>
              {condicionesPago.map((condicion) => (
                <MenuItem key={condicion.id} value={condicion.id.toString()}>
                  {condicion.nombre}
                  {Number(condicion.dias_plazo) > 0 && ` (${condicion.dias_plazo} días)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Si es contado mostramos monto recibido */}
          {esContado && (
            <>
              <TextField
                label="Monto recibido"
                type="number"
                size="small"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                fullWidth
                sx={{ mt: 0 }}
                error={Number(montoRecibido || 0) < Number(total || 0)}
                helperText={Number(montoRecibido || 0) < Number(total || 0) ? "El monto recibido debe ser mayor o igual al total" : ""}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">Cambio:</Typography>
                <Typography variant="body1" fontWeight="bold" color={cambio < 0 ? "error" : "success.main"}>
                  RD$ {cambio.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      {/* Lista de productos */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <Stack spacing={2}>
          {items.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4 }}>
              <CartIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>Carrito vacío</Typography>
              <Typography variant="body2" color="text.secondary">Agrega productos desde el catálogo</Typography>
            </Box>
          ) : (
            items.map((item) => (
              <Paper key={item.id_productos} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={`RD$ ${Number(item.precio_unitario || 0).toFixed(2)}`} size="small" color="primary" variant="outlined" />
                      <Chip label={`Subtotal: RD$ ${getItemSubtotal(item).toFixed(2)}`} size="small" color="success" sx={{ fontWeight: 'bold' }} />
                    </Stack>
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="Disminuir cantidad"><span>
                      <IconButton size="small" onClick={() => handleDecrement(item)} disabled={item.cantidad <= 1} sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                    </span></Tooltip>

                    <TextField
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => handleQuantityChange(item.id_productos, parseInt(e.target.value) || 1)}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        if (!val || val < 1) handleQuantityChange(item.id_productos, 1);
                      }}
                      inputProps={{ min: 1, max: 999, style: { textAlign: 'center', padding: '6px 8px' } }}
                      sx={{ width: 70, '& .MuiInputBase-root': { height: 40 } }}
                      size="small"
                    />

                    <Tooltip title="Aumentar cantidad">
                      <IconButton size="small" onClick={() => handleIncrement(item)} sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar producto">
                      <IconButton color="error" onClick={() => removeFromCart && removeFromCart(item.id_productos)} sx={{ ml: 1 }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Paper>
            ))
          )}
        </Stack>
      </Box>

      {/* Total y acciones */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.default", flexShrink: 0 }}>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Productos:</Typography>
            <Typography variant="body2">{items.length}</Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Total unidades:</Typography>
            <Typography variant="body2">{items.reduce((sum, it) => sum + Number(it.cantidad || 0), 0)}</Typography>
          </Box>

          <Divider />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
            <Typography variant="h6" fontWeight="bold">Total a pagar:</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ReceiptIcon fontSize="small" /> RD$ {Number(total || 0).toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      </Box>



      {/* Botón pagar */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", flexShrink: 0 }}>
        {/* Validaciones */}
        {(!clienteSeleccionado || !condicionPagoSeleccionada) && items.length > 0 && (
          <Alert severity="warning">
            {!clienteSeleccionado && !condicionPagoSeleccionada
              ? "Seleccione un cliente y una condición de pago para continuar"
              : !clienteSeleccionado
                ? "Seleccione un cliente para continuar"
                : "Seleccione una condición de pago para continuar"
            }
          </Alert>
        )}



        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          onClick={handleProcesar}
          disabled={items.length === 0 || procesando || !clienteSeleccionado || !condicionPagoSeleccionada || (esContado && Number(montoRecibido || 0) < Number(total || 0))}
          sx={{ py: 1.5, fontWeight: "bold", fontSize: "1rem", borderRadius: 2, textTransform: "none", boxShadow: 3, '&:hover': { boxShadow: 6, transform: 'translateY(-1px)' }, transition: 'all 0.2s', mt: 1 }}
        >
          {procesando ? "Procesando..." : `Pagar RD$ ${Number(total || 0).toFixed(2)}`}
        </Button>
      </Box>
    </Paper>
  );
}
