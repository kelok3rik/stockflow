import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControlLabel, Checkbox, Grid, CircularProgress, Snackbar, Alert
} from "@mui/material";

export default function UsuariosVentanasModal({ open, onClose, usuario, onSave }) {
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
  if (usuario) {
    // Inicializa los permisos tomando solo los booleanos, excepto 'activo'
    const permisosUsuario = Object.keys(usuario)
      .filter(k => typeof usuario[k] === "boolean" && k !== "activo")
      .reduce((acc, key) => ({ ...acc, [key]: usuario[key] }), {});
    setPermisos(permisosUsuario);
  } else {
    setPermisos({});
  }
}, [usuario, open]);


  const handleChange = (e) => {
    const { name, checked } = e.target;
    setPermisos(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      await onSave(usuario.id_usuarios, permisos);
      setSnackbar({ open: true, msg: "Permisos actualizados", severity: "success" });
      onClose();
    } catch (err) {
      setSnackbar({ open: true, msg: "Error al actualizar", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Asignar Ventanas a {usuario?.nombre}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {Object.keys(permisos).map(key => (
              <Grid item xs={6} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permisos[key]}
                      onChange={handleChange}
                      name={key}
                    />
                  }
                  label={key.replace(/_/g, " ")}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </>
  );
}
