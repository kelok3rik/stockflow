import {
  Box,
  Typography,
  Button,
  TextField,
  TablePagination,
  CircularProgress
} from "@mui/material";
import { useMemo, useState } from "react";
import useCondicionesPago from "./useCondicionesPagos";
import CondicionesPagoTable from "./CondicionesPagoTable";
import CondicionesPagoFormModal from "./CondicionesPagosFormModal";

export default function CondicionesPagoPage() {

  const { condiciones, loading, createCondicion, updateCondicion } = useCondicionesPago();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = (condicion = null) => {
    setSelected(condicion);
    setOpen(true);
  };

  const handleClose = () => {
    setSelected(null);
    setOpen(false);
  };

  const filtered = useMemo(() => {
    return condiciones.filter(c =>
      c.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [condiciones, search]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  return (
    <Box>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Condiciones de Pago</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Nueva condición
        </Button>
      </Box>

      {/* BUSCADOR */}
      <Box mb={2} maxWidth={300}>
        <TextField
          fullWidth
          size="small"
          label="Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Box>

      {loading ? <CircularProgress /> : (
        <>
          <CondicionesPagoTable
            condiciones={paginated}
            onEdit={handleOpen}
          />

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
        </>
      )}

      <CondicionesPagoFormModal
        open={open}
        condicion={selected}
        onClose={handleClose}
        onSave={async (data) => {
          if (selected) {
            await updateCondicion(selected.id_condiciones_pago, data);
          } else {
            await createCondicion(data);
          }
          handleClose();
        }}
      />

    </Box>
  );
}
