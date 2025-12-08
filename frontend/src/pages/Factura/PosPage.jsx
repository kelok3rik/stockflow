// frontend/src/pages/Factura/PosPage.jsx (actualización)
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
    Paper,
    Badge
} from "@mui/material";
import { ShoppingCart as CartIcon } from "@mui/icons-material";
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

    const handleProcesar = async (clienteId, condicionPagoId) => {
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
            const res = await procesarFactura(clienteId, condicionPagoId);
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
            <Box sx={{
                height: "100vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default"
            }}>


                {/* Contenido Principal */}
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                    p: 2,
                    gap: 2
                }}>
                    {/* Sección izquierda - Productos */}
                    <Box sx={{
                        flex: 7,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minWidth: 0
                    }}>
                        <Paper
                            elevation={0}
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                overflow: "hidden",
                                borderRadius: 2,
                                border: 1,
                                borderColor: "divider",
                                bgcolor: "background.paper"
                            }}
                        >
                            {/* Header de productos - FIJO */}
                            <Box sx={{
                                p: 2,
                                borderBottom: 1,
                                borderColor: "divider",
                                flexShrink: 0
                            }}>
                                <Typography variant="h6" fontWeight="medium">
                                    Productos Disponibles
                                    <Typography
                                        component="span"
                                        sx={{
                                            ml: 1,
                                            color: "text.secondary",
                                            fontSize: "0.875rem"
                                        }}
                                    >
                                        ({productos.length} productos)
                                    </Typography>
                                </Typography>
                            </Box>

                            {/* Componente de productos con scroll INTERNO */}
                            <Box sx={{
                                flex: 1,
                                overflow: "hidden",
                                position: "relative"
                            }}>
                                <PosProducts
                                    productos={productos}
                                    addToCart={addToCart}
                                    loading={loading}
                                />
                            </Box>
                        </Paper>
                    </Box>

                    {/* Sección derecha - Carrito */}
                    <Box sx={{
                        flex: 3,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minWidth: 0,
                        maxWidth: 420
                    }}>

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
                        '& .MuiAlert-icon': {
                            alignItems: 'center'
                        }
                    }}
                >
                    {notificacion.mensaje}
                </Alert>
            </Snackbar>
        </>
    );
}