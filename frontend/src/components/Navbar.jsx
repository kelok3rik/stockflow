import { useState } from "react";
import {
  Drawer, List, ListItemButton, ListItemText, ListItemIcon,
  AppBar, Toolbar, Typography, Box, Collapse, IconButton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Inventory as InventoryIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Inventario
  const [openInv, setOpenInv] = useState(false);
  const [openInvM, setOpenInvM] = useState(false);
  const [openInvP, setOpenInvP] = useState(false);
  const [openInvC, setOpenInvC] = useState(false);
  const [openInvR, setOpenInvR] = useState(false);

  // Cuentas por Cobrar
  const [openCXC, setOpenCXC] = useState(false);
  const [openCXCM, setOpenCXCM] = useState(false);
  const [openCXCP, setOpenCXCP] = useState(false);
  const [openCXCC, setOpenCXCC] = useState(false);
  const [openCXCR, setOpenCXCR] = useState(false);

  // Cuentas por Pagar
  const [openCXP, setOpenCXP] = useState(false);
  const [openCXPM, setOpenCXPM] = useState(false);
  const [openCXPP, setOpenCXPP] = useState(false);
  const [openCXPC, setOpenCXPC] = useState(false);
  const [openCXPR, setOpenCXPR] = useState(false);

  // Configuración
  const [openCFG, setOpenCFG] = useState(false);
  const [openCFGM, setOpenCFGM] = useState(false);
  const [openCFGC, setOpenCFGC] = useState(false);
  const [openCFGR, setOpenCFGR] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const nav = (path) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const expandIcon = (open) => open ? <ExpandLessIcon /> : <ExpandMoreIcon />;

  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton onClick={() => setDrawerOpen(true)} color="inherit">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Sistema de Gestión Empresarial</Typography>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 320 }}>

          {/* INVENTARIO */}
          <ListItemButton onClick={() => setOpenInv(!openInv)}>
            <ListItemIcon><InventoryIcon /></ListItemIcon>
            <ListItemText primary="Inventario" />
            {expandIcon(openInv)}
          </ListItemButton>

          <Collapse in={openInv}><List sx={{ pl: 3 }}>

            {/* MANTENIMIENTO */}
            <ListItemButton onClick={() => setOpenInvM(!openInvM)}>
              <ListItemText primary="Mantenimiento" />{expandIcon(openInvM)}
            </ListItemButton>
            <Collapse in={openInvM}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/inventario/productos")}><ListItemText primary="Productos" /></ListItemButton>
              <ListItemButton onClick={() => nav("/inventario/almacenes")}><ListItemText primary="Almacenes" /></ListItemButton>
              <ListItemButton onClick={() => nav("/inventario/ubicaciones")}><ListItemText primary="Ubicaciones" /></ListItemButton>
              <ListItemButton onClick={() => nav("/inventario/departamentos")}><ListItemText primary="Departamentos" /></ListItemButton>
              <ListItemButton onClick={() => nav("/inventario/grupos")}><ListItemText primary="Grupos" /></ListItemButton>
              <ListItemButton onClick={() => nav("/inventario/tipos-movimientos")}><ListItemText primary="Tipos de movimiento" /></ListItemButton>
            </List></Collapse>

            {/* PROCESOS */}
            <ListItemButton onClick={() => setOpenInvP(!openInvP)}>
              <ListItemText primary="Procesos" />{expandIcon(openInvP)}
            </ListItemButton>
            <Collapse in={openInvP}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/procesos/facturacion")}><ListItemText primary="Facturación" /></ListItemButton>
              <ListItemButton onClick={() => nav("/procesos/cotizacion")}><ListItemText primary="Cotización" /></ListItemButton>
              <ListItemButton onClick={() => nav("/procesos/compras")}><ListItemText primary="Compras" /></ListItemButton>
              <ListItemButton onClick={() => nav("/procesos/entradas-salidas")}><ListItemText primary="Entradas / Salidas" /></ListItemButton>
              <ListItemButton onClick={() => nav("/procesos/devoluciones")}><ListItemText primary="Devoluciones" /></ListItemButton>
            </List></Collapse>

            {/* CONSULTAS */}
            <ListItemButton onClick={() => setOpenInvC(!openInvC)}>
              <ListItemText primary="Consultas" />{expandIcon(openInvC)}
            </ListItemButton>
            <Collapse in={openInvC}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/consultas/cotizaciones")}><ListItemText primary="Cotizaciones" /></ListItemButton>
              <ListItemButton onClick={() => nav("/consultas/compras")}><ListItemText primary="Compras" /></ListItemButton>
              <ListItemButton onClick={() => nav("/consultas/entradas-salidas")}><ListItemText primary="Entradas / Salidas" /></ListItemButton>
              <ListItemButton onClick={() => nav("/consultas/devoluciones")}><ListItemText primary="Devoluciones" /></ListItemButton>
              <ListItemButton onClick={() => nav("/consultas/facturas")}><ListItemText primary="Facturas" /></ListItemButton>
            </List></Collapse>

            

          </List></Collapse>

          {/* CUENTAS POR COBRAR */}
          <ListItemButton onClick={() => setOpenCXC(!openCXC)}>
            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
            <ListItemText primary="Cuentas por Cobrar" />
            {expandIcon(openCXC)}
          </ListItemButton>

          <Collapse in={openCXC}><List sx={{ pl: 3 }}>
            <ListItemButton onClick={() => setOpenCXCM(!openCXCM)}><ListItemText primary="Mantenimiento" />{expandIcon(openCXCM)}</ListItemButton>
            <Collapse in={openCXCM}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/cxc/clientes")}><ListItemText primary="Clientes" /></ListItemButton>
            </List></Collapse>

            <ListItemButton onClick={() => setOpenCXCP(!openCXCP)}><ListItemText primary="Procesos" />{expandIcon(openCXCP)}</ListItemButton>
            <Collapse in={openCXCP}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/cxc/cobros")}><ListItemText primary="Cobro" /></ListItemButton>
            </List></Collapse>

            <ListItemButton onClick={() => setOpenCXCC(!openCXCC)}><ListItemText primary="Consultas" />{expandIcon(openCXCC)}</ListItemButton>
            <Collapse in={openCXCC}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/cxc/clientes-consulta")}><ListItemText primary="Clientes" /></ListItemButton>
              <ListItemButton onClick={() => nav("/cxc/cobros-consulta")}><ListItemText primary="Cobros" /></ListItemButton>
            </List></Collapse>

            

          </List></Collapse>

          {/* CUENTAS POR PAGAR */}
          <ListItemButton onClick={() => setOpenCXP(!openCXP)}>
            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
            <ListItemText primary="Cuentas por Pagar" />
            {expandIcon(openCXP)}
          </ListItemButton>

          <Collapse in={openCXP}><List sx={{ pl: 3 }}>
            <ListItemButton onClick={() => setOpenCXPM(!openCXPM)}><ListItemText primary="Mantenimiento" />{expandIcon(openCXPM)}</ListItemButton>
            <Collapse in={openCXPM}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/cxp/proveedores")}><ListItemText primary="Proveedores" /></ListItemButton>
            </List></Collapse>

            <ListItemButton onClick={() => setOpenCXPP(!openCXPP)}><ListItemText primary="Procesos" />{expandIcon(openCXPP)}</ListItemButton>
            <Collapse in={openCXPP}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/cxp/pagos")}><ListItemText primary="Pago" /></ListItemButton>
            </List></Collapse>

            <ListItemButton onClick={() => setOpenCXPC(!openCXPC)}><ListItemText primary="Consultas" />{expandIcon(openCXPC)}</ListItemButton>
            <Collapse in={openCXPC}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/cxp/proveedores-consulta")}><ListItemText primary="Proveedores" /></ListItemButton>
              <ListItemButton onClick={() => nav("/cxp/pagos-consulta")}><ListItemText primary="Pagos" /></ListItemButton>
            </List></Collapse>

            
          </List></Collapse>

          {/* CONFIGURACIÓN */}
          <ListItemButton onClick={() => setOpenCFG(!openCFG)}>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary="Configuración" />
            {expandIcon(openCFG)}
          </ListItemButton>

          <Collapse in={openCFG}><List sx={{ pl: 3 }}>
            <ListItemButton onClick={() => setOpenCFGM(!openCFGM)}><ListItemText primary="Mantenimiento" />{expandIcon(openCFGM)}</ListItemButton>
            <Collapse in={openCFGM}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/config/usuarios")}><ListItemText primary="Usuario" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/usuario-ventana")}><ListItemText primary="Usuario vs Ventana" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/empresa")}><ListItemText primary="Empresa" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/roles")}><ListItemText primary="Roles" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/moneda")}><ListItemText primary="Moneda" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/condicion")}><ListItemText primary="Condición" /></ListItemButton>
            </List></Collapse>

            <ListItemButton onClick={() => setOpenCFGC(!openCFGC)}><ListItemText primary="Consultas" />{expandIcon(openCFGC)}</ListItemButton>
            <Collapse in={openCFGC}><List sx={{ pl: 3 }}>
              <ListItemButton onClick={() => nav("/config/usuarios-consulta")}><ListItemText primary="Usuario" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/usuario-ventana-consulta")}><ListItemText primary="Usuario vs Ventana" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/empresa-consulta")}><ListItemText primary="Empresa" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/roles-consulta")}><ListItemText primary="Roles" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/moneda-consulta")}><ListItemText primary="Moneda" /></ListItemButton>
              <ListItemButton onClick={() => nav("/config/condicion-consulta")}><ListItemText primary="Condición" /></ListItemButton>
            </List></Collapse>

            
          </List></Collapse>

          {/* CERRAR SESIÓN */}
          <ListItemButton onClick={logout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>

        </List>
      </Drawer>
    </Box>
  );
}
