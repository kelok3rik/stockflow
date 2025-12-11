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

  // Valores locales para selects
  const [clienteSelectValue, setClienteSelectValue] = useState(
    clienteSeleccionado ? clienteSeleccionado.toString() : ""
  );

  const [condicionSelectValue, setCondicionSelectValue] = useState(
    condicionPagoSeleccionada ? condicionPagoSeleccionada.toString() : ""
  );

  // Monto recibido (solo contado)
  const [montoRecibido, setMontoRecibido] = useState("");

  useEffect(() => {
    setClienteSelectValue(clienteSeleccionado ? clienteSeleccionado.toString() : "");
  }, [clienteSeleccionado]);

  useEffect(() => {
    setCondicionSelectValue(
      condicionPagoSeleccionada ? condicionPagoSeleccionada.toString() : ""
    );
    setMontoRecibido("");
  }, [condicionPagoSeleccionada]);

  // Obtener objeto completo de la condición seleccionada
  const condicionObj = condicionesPago.find(
    (cp) =>
      String(cp.id_condiciones_pago) === String(condicionPagoSeleccionada)
  );

  // Detectar si es contado
  const esContado = useMemo(() => {
    if (!condicionObj) return false;
    const byDias = Number(condicionObj.dias_plazo) === 0;
    const byName = String(condicionObj.nombre).toLowerCase().includes("contado");
    return byDias || byName;
  }, [condicionObj]);

  // Calcular cambio
  const cambio = useMemo(() => {
    if (!esContado) return 0;
    const recibido = Number(montoRecibido) || 0;
    return recibido - Number(total || 0);
  }, [montoRecibido, total, esContado]);

  // Handlers selects
  const handleClienteChange = (event) => {
    const value = event.target.value;
    setClienteSelectValue(value);
    onClienteChange && onClienteChange(value === "" ? null : Number(value));
  };

  const handleCondicionPagoChange = (event) => {
    const value = event.target.value;
    setCondicionSelectValue(value);
    onCondicionPagoChange &&
      onCondicionPagoChange(value === "" ? null : Number(value));
  };

  // Cantidades
  const handleQuantityChange = (id, newQuantity) => {
    const q = Number(newQuantity) || 0;
    if (q >= 1 && q <= 999) {
      changeQuantity && changeQuantity(id, q);
    }
  };

  const handleIncrement = (item) =>
    handleQuantityChange(item.id_productos, item.cantidad + 1);

  const handleDecrement = (item) => {
    if (item.cantidad > 1)
      handleQuantityChange(item.id_productos, item.cantidad - 1);
  };

  const getItemSubtotal = (item) =>
    (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);

  // PROCESAR FACTURA
  const handleProcesar = () => {
    if (!clienteSeleccionado) return;
    if (!condicionPagoSeleccionada) return;

    if (esContado) {
      const recibido = Number(montoRecibido) || 0;
      if (recibido < Number(total || 0)) return;
    }

    onProcesarFactura &&
      onProcesarFactura(
        clienteSeleccionado,
        condicionPagoSeleccionada,
        esContado ? Number(montoRecibido) : 0,
        esContado ? Number(cambio) : 0
      );
  };

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
        bgcolor: "background.paper",
        minWidth: 0,          // ← FIX 1
        maxWidth: "100%",     // ← FIX 2
        boxSizing: "border-box", // ← FIX 3
      }}
    >



      {/* Selectores */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.default",
          flexShrink: 0
        }}
      >
        <Stack spacing={2}>
          {/* Cliente */}
          <FormControl fullWidth size="small">
            <InputLabel>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PersonIcon fontSize="small" /> Cliente
              </Box>
            </InputLabel>
            <Select value={clienteSelectValue} onChange={handleClienteChange} size="small">
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

          {/* Condición de pago */}
          <FormControl fullWidth size="small">
            <InputLabel>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PaymentIcon fontSize="small" /> Condición de Pago
              </Box>
            </InputLabel>

            <Select
              value={condicionSelectValue}
              onChange={handleCondicionPagoChange}
              size="small"
            >
              <MenuItem value="">
                <em>Seleccionar condición</em>
              </MenuItem>

              {condicionesPago.map((condicion) => (
                <MenuItem
                  key={condicion.id_condiciones_pago}
                  value={String(condicion.id_condiciones_pago)}
                >
                  {condicion.nombre}
                  {Number(condicion.dias_plazo) > 0 &&
                    ` (${condicion.dias_plazo} días)`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* MONTO RECIBIDO - SOLO CONTADO */}
          {esContado && (
            <>
              <TextField
                label="Monto recibido"
                type="number"
                size="small"
                fullWidth
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                error={Number(montoRecibido || 0) < Number(total || 0)}
                helperText={
                  Number(montoRecibido || 0) < Number(total || 0)
                    ? "El monto recibido debe ser ≥ al total"
                    : ""
                }
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Cambio:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={cambio < 0 ? "error" : "success.main"}
                >
                  RD$ {cambio.toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </Box>

      {/* Lista productos */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        <Stack spacing={2}>
          {items.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CartIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                Carrito vacío
              </Typography>
            </Box>
          ) : (
            items.map((item) => (
              <Paper
                key={item.id_productos}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:hover": { borderColor: "primary.light", bgcolor: "action.hover" }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {item.nombre}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        label={`RD$ ${Number(item.precio_unitario).toFixed(2)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Subtotal: RD$ ${getItemSubtotal(item).toFixed(2)}`}
                        size="small"
                        color="success"
                      />
                    </Stack>
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleDecrement(item)}
                      disabled={item.cantidad <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>

                    <TextField
                      type="number"
                      value={item.cantidad}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.id_productos,
                          parseInt(e.target.value) || 1
                        )
                      }
                      size="small"
                      sx={{ width: 70 }}
                    />

                    <IconButton size="small" onClick={() => handleIncrement(item)}>
                      <AddIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => removeFromCart(item.id_productos)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </Paper>
            ))
          )}
        </Stack>
      </Box>

      {/* TOTAL Y BOTÓN */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {(!clienteSeleccionado || !condicionPagoSeleccionada) &&
          items.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              {!clienteSeleccionado && !condicionPagoSeleccionada
                ? "Seleccione un cliente y una condición de pago"
                : !clienteSeleccionado
                  ? "Seleccione un cliente"
                  : "Seleccione una condición de pago"}
            </Alert>
          )}

        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          onClick={handleProcesar}
          disabled={
            items.length === 0 ||
            procesando ||
            !clienteSeleccionado ||
            !condicionPagoSeleccionada ||
            (esContado && Number(montoRecibido || 0) < Number(total || 0))
          }
          sx={{ py: 1.5, fontWeight: "bold", fontSize: "1rem", borderRadius: 2 }}
        >
          {procesando ? "Procesando..." : `Pagar RD$ ${Number(total).toFixed(2)}`}
        </Button>
      </Box>
    </Paper>
  );
}
