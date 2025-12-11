// frontend/src/pages/Factura/PosPage.jsx
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
    Paper
} from "@mui/material";

import { useState } from "react";
import usePos from "./usePos";
import PosProducts from "./PosProducts";
import PosCart from "./PosCart";

export default function PosPage() {
    const {
        productos,
        carrito,
        clientes,
        condicionesPago,
        loading,
        total,
        addToCart,
        changeQuantity,
        removeFromCart,
        procesarFactura,
    } = usePos();

    const [notificacion, setNotificacion] = useState({
        open: false,
        mensaje: "",
        tipo: "success"
    });

    const [procesando, setProcesando] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState("");
    const [condicionPagoSeleccionada, setCondicionPagoSeleccionada] = useState("");

    const handleProcesar = async (clienteId, condicionPagoId, montoRecibido, cambio) => {
        if (carrito.length === 0) {
            mostrarNotificacion("El carrito está vacío", "warning");
            return;
        }

        if (!clienteId) {
            mostrarNotificacion("Debe seleccionar un cliente", "warning");
            return;
        }

        if (!condicionPagoId) {
            mostrarNotificacion("Debe seleccionar una condición de pago", "warning");
            return;
        }

        setProcesando(true);
        try {
            const res = await procesarFactura(
                clienteId,
                condicionPagoId,
                montoRecibido,
                cambio
            );

            if (res?.error) {
                mostrarNotificacion(res.error, "error");
            } else {
                mostrarNotificacion("Factura procesada correctamente!", "success");
                setClienteSeleccionado("");
                setCondicionPagoSeleccionada("");
            }
        } catch (error) {
            mostrarNotificacion("Error al procesar la factura", "error");
        } finally {
            setProcesando(false);
        }
    };


    const mostrarNotificacion = (mensaje, tipo = "success") => {
        setNotificacion({ open: true, mensaje, tipo });
    };

    const cerrarNotificacion = () => {
        setNotificacion({ ...notificacion, open: false });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Cargando sistema POS...
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    height: "100vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.default",
                    p: 2
                }}
            >
                {/* LAYOUT PRINCIPAL */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: "hidden",
                        display: "flex",
                        gap: 2,

                        // 🔥 BREAKPOINTS (RESPONSIVE)
                        flexDirection: {
                            xs: "column", // móvil
                            sm: "column", // tablet
                            md: "row"     // desktop
                        }
                    }}
                >

                    {/* IZQUIERDA: PRODUCTOS */}
                    <Box
                        sx={{
                            flex: {
                                xs: "1 1 100%",  // móvil
                                sm: "1 1 100%",  // tablet
                                md: "0 0 70%"    // desktop
                            },
                            maxWidth: {
                                xs: "100%",
                                sm: "100%",
                                md: "70%"
                            },
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            overflow: "hidden",
                            pr: { md: 1 }
                        }}
                    >
                        <Paper
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 2,
                                overflow: "hidden",
                                minWidth: 0
                            }}
                        >
                            {/* Header productos */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderBottom: "1px solid",
                                    borderColor: "divider",
                                    flexShrink: 0
                                }}
                            >
                                <Typography variant="h6" fontWeight="medium">
                                    Productos Disponibles
                                </Typography>
                            </Box>

                            {/* Lista productos */}
                            <Box sx={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
                                <PosProducts productos={productos} addToCart={addToCart} />
                            </Box>
                        </Paper>
                    </Box>


                    {/* DERECHA: CARRITO */}
                    <Box
                        sx={{
                            flex: {
                                xs: "1 1 100%",  // móvil
                                sm: "1 1 100%",  // tablet
                                md: "0 0 30%"    // desktop
                            },
                            maxWidth: {
                                xs: "100%",
                                sm: "100%",
                                md: "30%"
                            },
                            minWidth: 0, // 🔥 FIX PRINCIPAL
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            overflow: "hidden",
                            pl: { md: 1 },
                            borderLeft: {
                                xs: "none",
                                md: "1px solid"
                            },
                            borderColor: "divider",
                            boxSizing: "border-box"
                        }}
                    >
                        <PosCart
                            carrito={carrito}
                            clientes={clientes}
                            condicionesPago={condicionesPago}
                            clienteSeleccionado={clienteSeleccionado}
                            condicionPagoSeleccionada={condicionPagoSeleccionada}
                            onClienteChange={setClienteSeleccionado}
                            onCondicionPagoChange={setCondicionPagoSeleccionada}
                            removeFromCart={removeFromCart}
                            changeQuantity={changeQuantity}
                            total={total}
                            procesando={procesando}
                            onProcesarFactura={handleProcesar}
                        />
                    </Box>

                </Box>
            </Box>


            {/* Notificaciones */}
            <Snackbar
                open={notificacion.open}
                autoHideDuration={4000}
                onClose={cerrarNotificacion}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={cerrarNotificacion}
                    severity={notificacion.tipo}
                    variant="filled"
                    sx={{
                        width: "100%",
                        '& .MuiAlert-icon': { alignItems: 'center' }
                    }}
                >
                    {notificacion.mensaje}
                </Alert>
            </Snackbar>
        </>
    );
}
