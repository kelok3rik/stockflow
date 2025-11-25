# StockFlow Backend

Backend del sistema de **Inventario, Ventas, Cuentas por Cobrar, Cuentas por Pagar y Configuración Empresarial**, desarrollado con Node.js, Express y PostgreSQL.

## 🚀 Tecnologías Utilizadas
- **Node.js** – Entorno de ejecución
- **Express.js** – Framework backend minimalista
- **PostgreSQL** – Base de datos relacional
- **Docker** + **Docker Compose** – Entorno de desarrollo aislado


## 📦 Características del Backend
- CRUDs completos para:
  - Productos  
  - Almacenes  
  - Ubicaciones  
  - Departamentos  
  - Grupos  
  - Tipos de movimiento  
  - Clientes  
  - Proveedores  
  - Usuarios  
  - Roles  
  - Monedas  
  - Condiciones de pago  

- Procesos del sistema:
  - Facturación (resta inventario + genera CxC)
  - Cotizaciones (no afectan inventario)
  - Compras (aumentan inventario + generan CxP)
  - Entradas/Salidas por ajuste
  - Devoluciones de ventas
  - Cobros (CxC)
  - Pagos (CxP)


- Validaciones obligatorias:
  - Stock suficiente al facturar
  - Montos mayores que 0
  - No permitir eliminar registros: solo desactivar
  - Integridad estricta de los saldos

- Reportes:
  - Movimiento por producto (Kardex)
  - Reportes básicos en PDF
  - Exportación  a Excel/CSV

## 🐳 Ejecutar con Docker
```bash
docker-compose up --build
