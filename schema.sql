-- =========================================================
--   CREACIÓN DE ESQUEMA PARA SISTEMA DE INVENTARIO
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- TABLA: role
-- =====================================
CREATE TABLE role (
    id_roles BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(60) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: usuario
-- =====================================
CREATE TABLE usuario (
    id_usuarios BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    id_rol BIGINT REFERENCES role(id_roles),
    activo BOOLEAN DEFAULT TRUE,

    -- Permisos del sistema
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

-- =====================================
-- TABLA: moneda
-- =====================================
CREATE TABLE moneda (
    id_monedas BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(3) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    simbolo VARCHAR(6),
    tasa_cambio NUMERIC(18,6) DEFAULT 1,
    es_base BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: condicion_pago
-- =====================================
CREATE TABLE condicion_pago (
    id_condiciones_pago BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    dias_plazo INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: empresa
-- =====================================
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

-- =====================================
-- TABLA: departamento
-- =====================================
CREATE TABLE departamento (
    id_departamentos BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(80) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: grupo
-- =====================================
CREATE TABLE grupo (
    id_grupos BIGSERIAL PRIMARY KEY,
    departamento_id BIGINT 
        REFERENCES departamento(id_departamentos),
    nombre VARCHAR(80) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: almacen
-- =====================================
CREATE TABLE almacen (
    id_almacen BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: ubicacion
-- =====================================
CREATE TABLE ubicacion (
    id_ubicaciones BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(40),
    nombre VARCHAR(120),
    id_almacen BIGINT REFERENCES almacen(id_almacen),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: tipo_movimiento
-- =====================================
CREATE TABLE tipo_movimiento (
    id_tipos_movimiento BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(80) UNIQUE NOT NULL,
    clase VARCHAR(7) CHECK (clase IN ('ENTRADA','SALIDA')),
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: producto
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
-- TABLA: cliente
-- =====================================
CREATE TABLE cliente (
    id_clientes BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    doc_identidad VARCHAR(40),
    email VARCHAR(120),
    telefono VARCHAR(40),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================
-- TABLA: proveedor
-- =====================================
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
    'admin123',        -- SIN HASH COMO PEDISTE
    1,
    TRUE,
    TRUE, TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, TRUE, TRUE
);

INSERT INTO moneda (codigo, nombre, simbolo, tasa_cambio, es_base, activo) VALUES
('DOP', 'Peso Dominicano', '$', 1, TRUE, TRUE);
