// frontend/src/pages/Factura/PosProducts.jsx

import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Badge,
  useTheme,
  useMediaQuery,
  Alert,
  LinearProgress,
  Skeleton
} from "@mui/material";
import {
  AddShoppingCart as AddCartIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingIcon,
  LocalOffer as OfferIcon,
  Bolt as BoltIcon
} from "@mui/icons-material";
import { useState, useMemo, useRef, useEffect } from "react";

export default function PosProducts({ productos, addToCart, loading = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nombre"); // 'nombre', 'precio', 'stock'
  const [sortOrder, setSortOrder] = useState("asc");
  const [quickAddQuantity, setQuickAddQuantity] = useState({});
  const searchInputRef = useRef(null);

  // Filtrar productos basado en búsqueda
  const filteredProducts = useMemo(() => {
    return productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [productos, searchTerm]);

  // Ordenar productos
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'precio':
          aValue = a.precio_venta;
          bValue = b.precio_venta;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        default:
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredProducts, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleQuickAdd = (producto, e) => {
    e.stopPropagation();
    const quantity = quickAddQuantity[producto.id_productos] || 1;
    addToCart({ ...producto, cantidad: quantity });
    setQuickAddQuantity(prev => ({ ...prev, [producto.id_productos]: 1 }));
  };

  const handleAddWithQuantity = (producto, quantity) => {
    if (quantity >= 1 && quantity <= producto.stock) {
      addToCart({ ...producto, cantidad: quantity });
      setQuickAddQuantity(prev => ({ ...prev, [producto.id_productos]: 1 }));
    }
  };

  const getStockColor = (stock) => {
    if (stock <= 0) return 'error';
    if (stock <= 5) return 'warning';
    if (stock <= 10) return 'info';
    return 'success';
  };

  const getStockLabel = (stock) => {
    if (stock <= 0) return 'Agotado';
    if (stock <= 5) return 'Bajo stock';
    return 'Disponible';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Focus en la búsqueda al cargar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Vista de carga
  if (loading) {
    return (
      <Box sx={{ 
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2 
      }}>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  // Vista sin productos
  if (productos.length === 0) {
    return (
      <Box sx={{ 
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: 'center',
        p: 4
      }}>
        <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay productos disponibles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Los productos aparecerán aquí cuando estén disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header con controles - FIJADO ARRIBA */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          flexShrink: 0 // No se encoge con scroll
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          {/* Búsqueda */}
          <TextField
            fullWidth
            placeholder="Buscar productos por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            inputRef={searchInputRef}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setSearchTerm("")}
                    edge="end"
                  >
                    <Typography variant="caption">✕</Typography>
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: { sm: 400 } }}
          />

          {/* Contadores y ordenamiento */}
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            sx={{ 
              flexShrink: 0,
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Badge 
              badgeContent={filteredProducts.length} 
              color="primary"
              sx={{ 
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Productos
              </Typography>
            </Badge>

            {/* Botones de ordenamiento */}
            <Tooltip title="Ordenar por nombre">
              <IconButton 
                size="small" 
                onClick={() => handleSort('nombre')}
                color={sortBy === 'nombre' ? 'primary' : 'default'}
              >
                <SortIcon />
                {sortBy === 'nombre' && (
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Ordenar por precio">
              <IconButton 
                size="small" 
                onClick={() => handleSort('precio')}
                color={sortBy === 'precio' ? 'primary' : 'default'}
              >
                <TrendingIcon />
                {sortBy === 'precio' && (
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Ordenar por stock">
              <IconButton 
                size="small" 
                onClick={() => handleSort('stock')}
                color={sortBy === 'stock' ? 'primary' : 'default'}
              >
                <InventoryIcon />
                {sortBy === 'stock' && (
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Typography>
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Estado de búsqueda */}
        {searchTerm && filteredProducts.length === 0 && (
          <Alert 
            severity="info" 
            sx={{ mt: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setSearchTerm("")}
              >
                Limpiar búsqueda
              </Button>
            }
          >
            No se encontraron productos para "{searchTerm}"
          </Alert>
        )}
      </Paper>

      {/* CONTENEDOR CON SCROLL PARA PRODUCTOS */}
      <Box sx={{ 
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        pr: 1, // Espacio para la barra de scroll
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.grey[100],
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.grey[400],
          borderRadius: '4px',
          '&:hover': {
            background: theme.palette.grey[500],
          }
        }
      }}>
        {sortedProducts.length === 0 ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
            flexDirection="column"
            gap={2}
            p={4}
          >
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? "No se encontraron productos" : "No hay productos disponibles"}
            </Typography>
            {searchTerm && (
              <Button 
                variant="outlined" 
                onClick={() => setSearchTerm("")}
                size="small"
              >
                Limpiar búsqueda
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2}>
            {sortedProducts.map((producto) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={producto.id_productos}>
                <Card 
                  elevation={1}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      borderColor: 'primary.light'
                    },
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    position: 'relative'
                  }}
                >
                  {/* Etiqueta de stock bajo */}
                  {producto.stock <= 5 && producto.stock > 0 && (
                    <Chip
                      label="¡ÚLTIMAS UNIDADES!"
                      color="warning"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                        fontSize: '0.65rem',
                        zIndex: 1
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Nombre del producto */}
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="medium"
                      gutterBottom
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        height: '2.8em'
                      }}
                    >
                      {producto.nombre}
                    </Typography>

                    {/* Descripción (si existe) */}
                    {producto.descripcion && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          height: '2.8em',
                          mb: 2
                        }}
                      >
                        {producto.descripcion}
                      </Typography>
                    )}

                    {/* Información de precio y stock */}
                    <Stack spacing={1} sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {formatPrice(producto.precio_venta)}
                        </Typography>
                        
                        <Chip
                          icon={producto.stock > 0 ? <InventoryIcon /> : <BoltIcon />}
                          label={getStockLabel(producto.stock)}
                          color={getStockColor(producto.stock)}
                          size="small"
                          variant={producto.stock > 0 ? "outlined" : "filled"}
                        />
                      </Box>

                      {/* Barra de progreso para stock */}
                      {producto.stock > 0 && (
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((producto.stock / 50) * 100, 100)}
                            color={getStockColor(producto.stock)}
                            sx={{ 
                              height: 4, 
                              borderRadius: 2,
                              mb: 0.5 
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {producto.stock} unidades disponibles
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    {producto.stock > 0 ? (
                      <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                        {/* Selector de cantidad rápida */}
                        <TextField
                          type="number"
                          size="small"
                          value={quickAddQuantity[producto.id_productos] || 1}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(producto.stock, parseInt(e.target.value) || 1));
                            setQuickAddQuantity(prev => ({
                              ...prev,
                              [producto.id_productos]: val
                            }));
                          }}
                          inputProps={{ 
                            min: 1,
                            max: producto.stock,
                            style: { 
                              width: '60px',
                              textAlign: 'center'
                            }
                          }}
                          sx={{ flexShrink: 0 }}
                        />
                        
                        {/* Botón agregar */}
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddCartIcon />}
                          onClick={(e) => handleQuickAdd(producto, e)}
                          disabled={producto.stock <= 0}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold'
                          }}
                        >
                          Agregar
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        disabled
                        sx={{ borderRadius: 2 }}
                      >
                        Agotado
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Footer con estadísticas - DENTRO DEL SCROLL */}
        {sortedProducts.length > 0 && (
          <Paper 
            elevation={0} 
            sx={{ 
              mt: 3, 
              p: 2, 
              mb: 2,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="space-between" 
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                Mostrando {filteredProducts.length} de {productos.length} productos
              </Typography>
              
              <Stack direction="row" spacing={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Precio promedio
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatPrice(
                      filteredProducts.reduce((sum, p) => sum + p.precio_venta, 0) / filteredProducts.length
                    )}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Stock total
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {filteredProducts.reduce((sum, p) => sum + p.stock, 0)} unidades
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  );
}