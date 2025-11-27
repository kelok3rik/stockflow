import { Box } from "@mui/material";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <Box display="flex">
      <Box width={260} bgcolor="#0D1B2A" color="white" minHeight="100vh">
        <Navbar />
      </Box>
      <Box flex={1} p={3}>
        {children}
      </Box>
    </Box>
  );
}
