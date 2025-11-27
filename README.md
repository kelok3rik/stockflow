# 📦 StockFlow
Sistema de Inventario, Ventas, Cuentas por Cobrar, Cuentas por Pagar y Configuración Empresarial

---

## 📖 Descripción General

**StockFlow** es un sistema empresarial diseñado para gestionar de forma eficiente:

- Inventario
- Facturación y Compras
- Cuentas por Cobrar (CxC)
- Cuentas por Pagar (CxP)
- Configuración del sistema
- Reportes financieros y de movimientos

El sistema está dividido en **Frontend** y **Backend**, con arquitectura cliente-servidor y una base de datos relacional robusta.

---

## 🧱 Arquitectura del Proyecto

```
stockflow/
├── stockflow-backend
└── stockflow-frontend
```

---

## 🛠️ Tecnologías Utilizadas

### 🎨 Frontend
- React
- Material UI (MUI)

### ⚙️ Backend
- Node.js
- Express.js

### 🗄️ Base de Datos
- PostgreSQL
- pgAdmin

### 🐳 Infraestructura
- Docker
- Docker Compose

---

## 🏗️ Arquitectura Lógica

```
Frontend (React + MUI)
         ↓
Backend API (Node + Express)
         ↓
Base de Datos (PostgreSQL)
```

Orquestado con:

```
Docker Compose
```

---

## 📦 MÓDULOS DEL SISTEMA

## 🏷️ INVENTARIO

### Mantenimientos
- Productos
- Almacenes
- Ubicaciones
- Departamentos
- Grupos
- Tipos de movimiento

### Procesos
- Facturación
- Cotización
- Compras
- Entradas / Salidas
- Devoluciones

### Consultas
- Cotizaciones
- Compras
- Entradas / Salidas
- Devoluciones
- Facturas

### Reportes
- Cotizaciones
- Compras
- Entradas / Salidas
- Devoluciones
- Facturas
- Movimiento por producto (Kardex)

---

## 💵 CUENTAS POR COBRAR (CxC)

### Mantenimiento
- Clientes

### Procesos
- Cobros

### Consultas
- Clientes
- Cobros

### Reportes
- Clientes
- Cobros

---

## 💳 CUENTAS POR PAGAR (CxP)

### Mantenimiento
- Proveedores

### Procesos
- Pagos

### Consultas
- Proveedores
- Pagos

### Reportes
- Proveedores
- Pagos

---

## ⚙️ CONFIGURACIÓN

### Mantenimiento
- Usuarios
- Usuario vs Ventana
- Empresa
- Roles
- Moneda
- Condición de Pago

### Consultas
- Usuarios
- Usuario vs Ventana
- Empresa
- Roles
- Moneda
- Condición

### Reportes
- Usuarios
- Usuario vs Ventana
- Empresa
- Roles
- Moneda
- Condición

---

## ✅ VALIDACIONES Y REGLAS DE NEGOCIO

- No permitir stock negativo
- Montos mayores que cero
- No se permiten eliminaciones, solo desactivaciones
- Control de integridad de saldos
- Validaciones obligatorias en backend
- Control de permisos por roles

---

## 🧠 PROCESOS AUTOMÁTICOS

| Proceso | Resultado |
|---------|-----------|
| Compra | Aumenta inventario + genera CxP |
| Facturación | Reduce inventario + genera CxC |
| Cobro | Reduce saldo de CxC |
| Pago | Reduce saldo de CxP |
| Devolución | Ajusta inventario y saldos |

---

## 📂 Estructura del Backend

```
src/
├── controllers
├── routes
├── services
├── models
├── validations
└── database
```

---

## 📂 Estructura del Frontend

```
src/
├── components
├── pages
├── context
├── services
└── routes
```

---

## 🐳 Instalación y Ejecución

### Backend (Docker)

```bash
docker-compose up --build
```

### Frontend

```bash
npm install
npm run dev
```

---

## 📌 Autor

Desarrollado por **Erik** 🇩🇴
