import { Box, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemText } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function MainLayout({ children }) {
  const { user, logout } = useAuth()
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Inventario Apps</Typography>
          {user && <Button color="inherit" onClick={logout}>Salir</Button>}
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: 200, flexShrink: 0, mt: 8 }}>
        <Toolbar />
        <List>
          <ListItem button>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Inventario" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  )
}
