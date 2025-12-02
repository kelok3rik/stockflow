import {
  Box,
  Typography,
  Button,
  TextField,
  TablePagination
} from "@mui/material";
import { useMemo, useState } from "react";
import useEmpresas from "./useEmpresas";
import useMonedas from "../monedas/useMonedas";
import EmpresasTable from "./EmpresasTable";
import EmpresasFormModal from "./EmpresasFormModal";

export default function EmpresasPage() {

  const { empresas, createEmpresa, updateEmpresa } = useEmpresas();
  const { monedas } = useMonedas();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = (empresa = null) => {
    setSelected(empresa);
    setOpen(true);
  };

  const handleClose = () => {
    setSelected(null);
    setOpen(false);
  };

  // ✅ FILTRO POR NOMBRE, RNC y EMAIL
  const filtered = useMemo(() => {
    return empresas.filter(e =>
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.rnc.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [empresas, search]);

  // ✅ PAGINACIÓN
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return (
    <Box>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Empresas</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Nueva Empresa
        </Button>
      </Box>

      {/* BUSCADOR */}
      <Box mb={2} maxWidth={300}>
        <TextField
          fullWidth
          size="small"
          label="Buscar empresa..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Box>

      {/* TABLA */}
      <EmpresasTable
        empresas={paginated}
        monedas={monedas}
        onEdit={handleOpen}
      />

      {/* PAGINACIÓN */}
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* MODAL */}
      <EmpresasFormModal
        open={open}
        empresa={selected}
        monedas={monedas}
        onClose={handleClose}
        onSave={async (data) => {
          if (selected) {
            await updateEmpresa(selected.id_empresa, data);
          } else {
            await createEmpresa(data);
          }
          handleClose();
        }}
      />

    </Box>
  );
}
