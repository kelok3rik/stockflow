import { Box, Typography } from "@mui/material";

export default function PosHeader() {
  return (
    <Box mb={2}>
      <Typography variant="h4" fontWeight={700}>
        Punto de Venta
      </Typography>
      <Typography variant="subtitle2" color="gray">
        Seleccione productos y procese la factura
      </Typography>
    </Box>
  );
}
