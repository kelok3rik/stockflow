// src/layouts/DashboardLayout

import { Box, Toolbar } from "@mui/material";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <Box display="flex" width="100%">
      <Navbar />

      {/* CONTENIDO */}
      <Box component="main" flex={1} sx={{ width: "100%" }}>

        {/* ESPACIO DEL APPBAR */}
        <Toolbar />

        {/* CONTENIDO REAL */}
        <Box
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
