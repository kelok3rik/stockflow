-- =========================================================
-- CREACIÓN DE ESQUEMA PARA SISTEMA DE INVENTARIO
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- TABLAS INDEPENDIENTES (Padres)
-- =====================================

CREATE TABLE role (
    id_roles BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(60) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE moneda (
    id_monedas BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(6),
    tasa_cambio NUMERIC(18,6) DEFAULT 1,
    es_base BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE condicion_pago (
    id_condiciones_pago BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    dias_plazo INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE empresa (
    id_empresa BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    rnc VARCHAR(30),
    direccion VARCHAR(255),
    telefono VARCHAR(40),
    email VARCHAR(120),
    logo_url VARCHAR(255),
    moneda_base_id BIGINT REFERENCES moneda(id_monedas)
);

CREATE TABLE departamento (
    id_departamentos BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(80) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE grupo (
    id_grupos BIGSERIAL PRIMARY KEY,
    departamento_id BIGINT REFERENCES departamento(id_departamentos),
    nombre VARCHAR(80) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE almacen (
    id_almacen BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE ubicacion (
    id_ubicaciones BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(40),
    nombre VARCHAR(120),
    id_almacen BIGINT REFERENCES almacen(id_almacen),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE tipo_movimiento (
    id_tipos_movimiento BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(80) UNIQUE NOT NULL,
    clase VARCHAR(7) CHECK (clase IN ('ENTRADA','SALIDA')),
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE usuario (
    id_usuarios BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    id_rol BIGINT REFERENCES role(id_roles),
    activo BOOLEAN DEFAULT TRUE,
    inv_productos BOOLEAN DEFAULT FALSE,
    inv_almacenes BOOLEAN DEFAULT FALSE,
    inv_ubicaciones BOOLEAN DEFAULT FALSE,
    inv_departamentos BOOLEAN DEFAULT FALSE,
    inv_grupos BOOLEAN DEFAULT FALSE,
    inv_cotizaciones BOOLEAN DEFAULT FALSE,
    inv_compras BOOLEAN DEFAULT FALSE,
    inv_movimientos BOOLEAN DEFAULT FALSE,
    inv_devoluciones BOOLEAN DEFAULT FALSE,
    inv_facturacion BOOLEAN DEFAULT FALSE,
    inv_consultas BOOLEAN DEFAULT FALSE,
    inv_reportes BOOLEAN DEFAULT FALSE,
    cxc_clientes BOOLEAN DEFAULT FALSE,
    cxc_cobros BOOLEAN DEFAULT FALSE,
    cxp_proveedores BOOLEAN DEFAULT FALSE,
    cxp_pagos BOOLEAN DEFAULT FALSE,
    conf_usuario BOOLEAN DEFAULT FALSE,
    conf_roles BOOLEAN DEFAULT FALSE,
    conf_empresa BOOLEAN DEFAULT FALSE,
    conf_moneda BOOLEAN DEFAULT FALSE,
    conf_condicion BOOLEAN DEFAULT FALSE
);

CREATE TABLE cliente (
    id_clientes BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    doc_identidad VARCHAR(40),
    email VARCHAR(120),
    telefono VARCHAR(40),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE proveedor (
    id_proveedores BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    rnc VARCHAR(40),
    email VARCHAR(120),
    telefono VARCHAR(40),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA PRODUCTO (depende de departamento, grupo y ubicacion)
-- =====================================

CREATE TABLE producto (
    id_productos BIGSERIAL PRIMARY KEY,
    sku VARCHAR(60) UNIQUE NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    departamento_id BIGINT REFERENCES departamento(id_departamentos),
    grupo_id BIGINT REFERENCES grupo(id_grupos),
    unidad VARCHAR(20),
    precio_venta NUMERIC(18,2) DEFAULT 0,
    costo NUMERIC(18,4) DEFAULT 0,
    stock NUMERIC(18,4) DEFAULT 0,
    stock_min NUMERIC(18,4) DEFAULT 0,
    ubicacion_id BIGINT REFERENCES ubicacion(id_ubicaciones),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLAS DE DOCUMENTOS PRINCIPALES
-- =====================================

CREATE TABLE factura (
    id_facturas BIGSERIAL PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    cliente_id BIGINT REFERENCES cliente(id_clientes),
    usuario_id BIGINT REFERENCES usuario(id_usuarios),
    fecha DATE DEFAULT CURRENT_DATE,
    condicion_id BIGINT REFERENCES condicion_pago(id_condiciones_pago),
    total NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE compra (
    id_compras BIGSERIAL PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id BIGINT REFERENCES proveedor(id_proveedores),
    usuario_id BIGINT REFERENCES usuario(id_usuarios),
    fecha DATE DEFAULT CURRENT_DATE,
    total NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cobro (
    id_cobros BIGSERIAL PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    cliente_id BIGINT REFERENCES cliente(id_clientes),
    usuario_id BIGINT REFERENCES usuario(id_usuarios),
    fecha DATE DEFAULT CURRENT_DATE,
    monto NUMERIC(18,2),
    metodo_pago VARCHAR(40),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE pago (
    id_pagos BIGSERIAL PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    proveedor_id BIGINT REFERENCES proveedor(id_proveedores),
    usuario_id BIGINT REFERENCES usuario(id_usuarios),
    fecha DATE DEFAULT CURRENT_DATE,
    monto NUMERIC(18,2),
    metodo_pago VARCHAR(40),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE devolucion (
    id_devoluciones BIGSERIAL PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    factura_id BIGINT REFERENCES factura(id_facturas),
    usuario_id BIGINT REFERENCES usuario(id_usuarios),
    fecha DATE DEFAULT CURRENT_DATE,
    total NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE movimiento_inventario (
    id_movimientos_inventario BIGSERIAL PRIMARY KEY,
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    producto_id BIGINT REFERENCES producto(id_productos),
    tipo_movimiento_id BIGINT REFERENCES tipo_movimiento(id_tipos_movimiento),
    usuario_id BIGINT REFERENCES usuario(id_usuarios),
    fecha DATE DEFAULT CURRENT_DATE,
    cantidad NUMERIC(18,4),
    referencia VARCHAR(120),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLAS DETALLE (dependen de documentos principales)
-- =====================================

CREATE TABLE factura_detalle (
    id_factura_detalle BIGSERIAL PRIMARY KEY,
    factura_id BIGINT REFERENCES factura(id_facturas),
    producto_id BIGINT REFERENCES producto(id_productos),
    cantidad NUMERIC(18,4),
    precio_unitario NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE compra_detalle (
    id_compra_detalle BIGSERIAL PRIMARY KEY,
    compra_id BIGINT REFERENCES compra(id_compras),
    producto_id BIGINT REFERENCES producto(id_productos),
    cantidad NUMERIC(18,4),
    costo_unitario NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cobro_detalle (
    id_cobro_detalle BIGSERIAL PRIMARY KEY,
    cobro_id BIGINT REFERENCES cobro(id_cobros),
    factura_id BIGINT REFERENCES factura(id_facturas),
    monto_aplicado NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE pago_detalle (
    id_pago_detalle BIGSERIAL PRIMARY KEY,
    pago_id BIGINT REFERENCES pago(id_pagos),
    compra_id BIGINT REFERENCES compra(id_compras),
    monto_aplicado NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cotizacion (
    id_cotizaciones BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT REFERENCES cliente(id_clientes),
    usuario_id BIGINT REFERENCES usuario(id_usuarios),
    fecha DATE DEFAULT CURRENT_DATE,
    total NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE cotizacion_detalle (
    id_cotizacion_detalle BIGSERIAL PRIMARY KEY,
    cotizacion_id BIGINT REFERENCES cotizacion(id_cotizaciones),
    producto_id BIGINT REFERENCES producto(id_productos),
    cantidad NUMERIC(18,4),
    precio_unitario NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE movimiento_inventario_detalle (
    id_movi_invd BIGSERIAL PRIMARY KEY,
    movimiento_inventario_id BIGINT REFERENCES movimiento_inventario(id_movimientos_inventario),
    producto_id BIGINT REFERENCES producto(id_productos),
    cantidad NUMERIC(18,4),
    costo_unitario NUMERIC(18,2),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- INSERTAR DATOS INICIALES
-- =====================================

INSERT INTO role (nombre, descripcion, activo) VALUES
('Administrador', 'Acceso total al sistema', TRUE),
('Usuario', 'Acceso limitado', TRUE);

INSERT INTO usuario (nombre, usuario, clave, id_rol, activo, 
inv_productos, inv_almacenes, inv_ubicaciones, inv_departamentos, inv_grupos,
conf_usuario, conf_roles, conf_empresa, conf_moneda, conf_condicion)
VALUES (
    'Admin General',
    'admin',
    'admin123',
    1,
    TRUE,
    TRUE, TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, TRUE, TRUE
);

INSERT INTO moneda (codigo, nombre, simbolo, tasa_cambio, es_base, activo) VALUES
('DOP', 'Peso Dominicano', '$', 1, TRUE, TRUE);

INSERT INTO departamento (id_departamentos, nombre) VALUES
(1, 'Comestibles'),
(2, 'Bebidas'),
(3, 'Lácteos'),
(4, 'Carnes'),
(5, 'Hogar'),
(6, 'Limpieza'),
(7, 'Electrónica'),
(8, 'Ferretería');

INSERT INTO grupo (id_grupos, departamento_id, nombre) VALUES
(1, 1, 'Enlatados'),
(2, 1, 'Granos'),
(3, 2, 'Refrescos'),
(4, 2, 'Alcohol'),
(5, 3, 'Quesos'),
(6, 3, 'Yogures'),
(7, 4, 'Res'),
(8, 4, 'Pollo'),
(9, 5, 'Plásticos'),
(10, 5, 'Cocina'),
(11, 7, 'Accesorios'),
(12, 8, 'Herramientas');

INSERT INTO almacen (id_almacen, codigo, nombre) VALUES
(1, 'ALM-001', 'Almacén Principal'),
(2, 'ALM-002', 'Almacén Secundario'),
(3, 'ALM-003', 'Almacén de Tienda');

INSERT INTO ubicacion (id_ubicaciones, codigo, nombre, id_almacen) VALUES
(1, 'A1', 'Pasillo A', 1),
(2, 'B1', 'Pasillo B', 1),
(3, 'R1', 'Rack 1', 2),
(4, 'R2', 'Rack 2', 2),
(5, 'M1', 'Mostrador', 3),
(6, 'D1', 'Mini Depósito', 3);

INSERT INTO tipo_movimiento (id_tipos_movimiento, nombre, clase, descripcion) VALUES
(1, 'COMPRA', 'ENTRADA', 'Entrada por compra'),
(2, 'VENTA', 'SALIDA', 'Salida por venta'),
(3, 'AJUSTE_POS', 'ENTRADA', 'Ajuste positivo'),
(4, 'AJUSTE_NEG', 'SALIDA', 'Ajuste negativo'),
(5, 'TRANSFERENCIA', 'SALIDA', 'Transferencia entre almacenes');

INSERT INTO producto (
    id_productos, sku, nombre, departamento_id, grupo_id, unidad,
    precio_venta, costo, stock, stock_min, ubicacion_id, activo
) VALUES
(1, 'SKU-ARZ10', 'Arroz Premium 10lb', 1, 2, 'UND', 350, 250, 120, 10, 1, TRUE),
(2, 'SKU-HAB440', 'Habichuelas Rojas 440g', 1, 2, 'UND', 75, 55, 200, 20, 1, TRUE),
(3, 'SKU-AG16', 'El Natural – Agua 16oz', 2, 3, 'UND', 15, 8, 300, 30, 2, TRUE),
(4, 'SKU-COC2L', 'Coca-Cola 2L', 2, 3, 'UND', 120, 85, 90, 10, 2, TRUE),
(5, 'SKU-CHED1', 'Queso Cheddar 1lb', 3, 5, 'UND', 240, 190, 40, 5, 5, TRUE),
(6, 'SKU-POLL1', 'Pollo Entero', 4, 8, 'UND', 200, 155, 60, 6, 5, TRUE),
(7, 'SKU-WD40', 'W40 Aceite Penetrante', 6, 12, 'UND', 275, 210, 25, 3, 3, TRUE),
(8, 'SKU-USBTC', 'Cargador USB Tipo C', 7, 11, 'UND', 150, 90, 50, 5, 6, TRUE);

INSERT INTO cliente (id_clientes, nombre, doc_identidad, email, telefono, direccion, activo) VALUES
(1, 'Juan Pérez', '40212345678', 'juanp@example.com', '809-555-1000', 'Santo Domingo', TRUE),
(2, 'María López', '00112345612', 'marial@example.com', '809-555-2000', 'Santiago', TRUE),
(3, 'Supermercado La Económica', '132456789', 'contacto@laeconomica.com', '809-555-3000', 'La Vega', TRUE),
(4, 'Bodega El Buen Precio', '40298765432', 'bodega@example.com', '809-555-4000', 'San Cristóbal', TRUE);

INSERT INTO proveedor (id_proveedores, nombre, rnc, email, telefono, direccion, activo) VALUES
(1, 'Mercantil Distributors', '131441234', 'ventas@mercantil.com', '809-555-1111', 'Santo Domingo', TRUE),
(2, 'Bebidas Nacionales SRL', '101556987', 'contacto@bebidasnac.com', '809-555-2222', 'Santiago', TRUE),
(3, 'Agroindustrial Dominicana', '130987654', 'ventas@agrodom.com', '809-555-3333', 'La Vega', TRUE),
(4, 'Tecnología Express', '110223344', 'info@tecexpress.com', '809-555-4444', 'Santo Domingo', TRUE);
