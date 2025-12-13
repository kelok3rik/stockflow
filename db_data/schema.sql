--
-- PostgreSQL database dump
--

\restrict cOLeZGOfv0HyH2hogP5CtWEZnuULnfUZq86glMuyBqaKgtOK710kDE3tyHWZzY7

-- Dumped from database version 15.15 (Debian 15.15-1.pgdg13+1)
-- Dumped by pg_dump version 15.15 (Debian 15.15-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: actualizar_saldo_factura(); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.actualizar_saldo_factura() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Restar el monto aplicado al saldo de la factura
    UPDATE factura
    SET saldo = saldo - NEW.monto_aplicado,
        estado = CASE
                    WHEN saldo - NEW.monto_aplicado <= 0 THEN 'PAGADA'
                    ELSE 'PENDIENTE'
                 END
    WHERE id_facturas = NEW.factura_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_saldo_factura() OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: almacen; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.almacen (
    id_almacen bigint NOT NULL,
    codigo character varying(40) NOT NULL,
    nombre character varying(120) NOT NULL,
    activo boolean DEFAULT true
);


ALTER TABLE public.almacen OWNER TO admin;

--
-- Name: almacen_id_almacen_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.almacen_id_almacen_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.almacen_id_almacen_seq OWNER TO admin;

--
-- Name: almacen_id_almacen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.almacen_id_almacen_seq OWNED BY public.almacen.id_almacen;


--
-- Name: cliente; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cliente (
    id_clientes bigint NOT NULL,
    nombre character varying(160) NOT NULL,
    doc_identidad character varying(40),
    email character varying(120),
    telefono character varying(40),
    direccion character varying(255),
    activo boolean DEFAULT true
);


ALTER TABLE public.cliente OWNER TO admin;

--
-- Name: cliente_id_clientes_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cliente_id_clientes_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cliente_id_clientes_seq OWNER TO admin;

--
-- Name: cliente_id_clientes_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cliente_id_clientes_seq OWNED BY public.cliente.id_clientes;


--
-- Name: cobro; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cobro (
    id_cobros bigint NOT NULL,
    numero_documento character varying(20) NOT NULL,
    cliente_id bigint,
    usuario_id bigint,
    fecha date DEFAULT CURRENT_DATE,
    monto numeric(18,2),
    metodo_pago character varying(40),
    activo boolean DEFAULT true
);


ALTER TABLE public.cobro OWNER TO admin;

--
-- Name: cobro_detalle; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cobro_detalle (
    id_cobro_detalle bigint NOT NULL,
    cobro_id bigint,
    factura_id bigint,
    monto_aplicado numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.cobro_detalle OWNER TO admin;

--
-- Name: cobro_detalle_id_cobro_detalle_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cobro_detalle_id_cobro_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cobro_detalle_id_cobro_detalle_seq OWNER TO admin;

--
-- Name: cobro_detalle_id_cobro_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cobro_detalle_id_cobro_detalle_seq OWNED BY public.cobro_detalle.id_cobro_detalle;


--
-- Name: cobro_id_cobros_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cobro_id_cobros_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cobro_id_cobros_seq OWNER TO admin;

--
-- Name: cobro_id_cobros_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cobro_id_cobros_seq OWNED BY public.cobro.id_cobros;


--
-- Name: compra; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.compra (
    id_compras bigint NOT NULL,
    numero_documento character varying(20) NOT NULL,
    proveedor_id bigint,
    usuario_id bigint,
    fecha date DEFAULT CURRENT_DATE,
    total numeric(18,2),
    activo boolean DEFAULT true,
    saldo numeric(18,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.compra OWNER TO admin;

--
-- Name: compra_detalle; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.compra_detalle (
    id_compra_detalle bigint NOT NULL,
    compra_id bigint,
    producto_id bigint,
    cantidad numeric(18,4),
    costo_unitario numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.compra_detalle OWNER TO admin;

--
-- Name: compra_detalle_id_compra_detalle_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.compra_detalle_id_compra_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.compra_detalle_id_compra_detalle_seq OWNER TO admin;

--
-- Name: compra_detalle_id_compra_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.compra_detalle_id_compra_detalle_seq OWNED BY public.compra_detalle.id_compra_detalle;


--
-- Name: compra_id_compras_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.compra_id_compras_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.compra_id_compras_seq OWNER TO admin;

--
-- Name: compra_id_compras_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.compra_id_compras_seq OWNED BY public.compra.id_compras;


--
-- Name: condicion_pago; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.condicion_pago (
    id_condiciones_pago bigint NOT NULL,
    nombre character varying(60) NOT NULL,
    dias_plazo integer DEFAULT 0,
    activo boolean DEFAULT true
);


ALTER TABLE public.condicion_pago OWNER TO admin;

--
-- Name: condicion_pago_id_condiciones_pago_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.condicion_pago_id_condiciones_pago_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.condicion_pago_id_condiciones_pago_seq OWNER TO admin;

--
-- Name: condicion_pago_id_condiciones_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.condicion_pago_id_condiciones_pago_seq OWNED BY public.condicion_pago.id_condiciones_pago;


--
-- Name: cotizacion; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cotizacion (
    id_cotizaciones bigint NOT NULL,
    cliente_id bigint,
    usuario_id bigint,
    fecha date DEFAULT CURRENT_DATE,
    total numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.cotizacion OWNER TO admin;

--
-- Name: cotizacion_detalle; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cotizacion_detalle (
    id_cotizacion_detalle bigint NOT NULL,
    cotizacion_id bigint,
    producto_id bigint,
    cantidad numeric(18,4),
    precio_unitario numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.cotizacion_detalle OWNER TO admin;

--
-- Name: cotizacion_detalle_id_cotizacion_detalle_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cotizacion_detalle_id_cotizacion_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cotizacion_detalle_id_cotizacion_detalle_seq OWNER TO admin;

--
-- Name: cotizacion_detalle_id_cotizacion_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cotizacion_detalle_id_cotizacion_detalle_seq OWNED BY public.cotizacion_detalle.id_cotizacion_detalle;


--
-- Name: cotizacion_id_cotizaciones_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.cotizacion_id_cotizaciones_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cotizacion_id_cotizaciones_seq OWNER TO admin;

--
-- Name: cotizacion_id_cotizaciones_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.cotizacion_id_cotizaciones_seq OWNED BY public.cotizacion.id_cotizaciones;


--
-- Name: departamento; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.departamento (
    id_departamentos bigint NOT NULL,
    nombre character varying(80) NOT NULL,
    activo boolean DEFAULT true
);


ALTER TABLE public.departamento OWNER TO admin;

--
-- Name: departamento_id_departamentos_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.departamento_id_departamentos_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departamento_id_departamentos_seq OWNER TO admin;

--
-- Name: departamento_id_departamentos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.departamento_id_departamentos_seq OWNED BY public.departamento.id_departamentos;


--
-- Name: devolucion; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.devolucion (
    id_devoluciones bigint NOT NULL,
    numero_documento character varying(20) NOT NULL,
    factura_id bigint,
    usuario_id bigint,
    fecha date DEFAULT CURRENT_DATE,
    total numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.devolucion OWNER TO admin;

--
-- Name: devolucion_id_devoluciones_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.devolucion_id_devoluciones_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.devolucion_id_devoluciones_seq OWNER TO admin;

--
-- Name: devolucion_id_devoluciones_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.devolucion_id_devoluciones_seq OWNED BY public.devolucion.id_devoluciones;


--
-- Name: empresa; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.empresa (
    id_empresa bigint NOT NULL,
    nombre character varying(160) NOT NULL,
    rnc character varying(30),
    direccion character varying(255),
    telefono character varying(40),
    email character varying(120),
    logo_url character varying(255),
    moneda_base_id bigint
);


ALTER TABLE public.empresa OWNER TO admin;

--
-- Name: empresa_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.empresa_id_empresa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.empresa_id_empresa_seq OWNER TO admin;

--
-- Name: empresa_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.empresa_id_empresa_seq OWNED BY public.empresa.id_empresa;


--
-- Name: factura; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.factura (
    id_facturas bigint NOT NULL,
    numero_documento character varying(20) NOT NULL,
    cliente_id bigint,
    usuario_id bigint,
    fecha date DEFAULT CURRENT_DATE,
    condicion_id bigint,
    total numeric(18,2),
    activo boolean DEFAULT true,
    saldo numeric(18,2) DEFAULT 0,
    estado character varying(20) DEFAULT 'PENDIENTE'::character varying
);


ALTER TABLE public.factura OWNER TO admin;

--
-- Name: factura_detalle; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.factura_detalle (
    id_factura_detalle bigint NOT NULL,
    factura_id bigint,
    producto_id bigint,
    cantidad numeric(18,4),
    precio_unitario numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.factura_detalle OWNER TO admin;

--
-- Name: factura_detalle_id_factura_detalle_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.factura_detalle_id_factura_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.factura_detalle_id_factura_detalle_seq OWNER TO admin;

--
-- Name: factura_detalle_id_factura_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.factura_detalle_id_factura_detalle_seq OWNED BY public.factura_detalle.id_factura_detalle;


--
-- Name: factura_id_facturas_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.factura_id_facturas_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.factura_id_facturas_seq OWNER TO admin;

--
-- Name: factura_id_facturas_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.factura_id_facturas_seq OWNED BY public.factura.id_facturas;


--
-- Name: grupo; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.grupo (
    id_grupos bigint NOT NULL,
    departamento_id bigint,
    nombre character varying(80) NOT NULL,
    activo boolean DEFAULT true
);


ALTER TABLE public.grupo OWNER TO admin;

--
-- Name: grupo_id_grupos_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.grupo_id_grupos_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grupo_id_grupos_seq OWNER TO admin;

--
-- Name: grupo_id_grupos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.grupo_id_grupos_seq OWNED BY public.grupo.id_grupos;


--
-- Name: moneda; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.moneda (
    id_monedas bigint NOT NULL,
    codigo character varying(3) NOT NULL,
    nombre character varying(50) NOT NULL,
    simbolo character varying(6),
    tasa_cambio numeric(18,6) DEFAULT 1,
    es_base boolean DEFAULT false,
    activo boolean DEFAULT true
);


ALTER TABLE public.moneda OWNER TO admin;

--
-- Name: moneda_id_monedas_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.moneda_id_monedas_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.moneda_id_monedas_seq OWNER TO admin;

--
-- Name: moneda_id_monedas_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.moneda_id_monedas_seq OWNED BY public.moneda.id_monedas;


--
-- Name: movimiento_inventario; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.movimiento_inventario (
    id_movimientos_inventario bigint NOT NULL,
    numero_documento character varying(20) NOT NULL,
    tipo_movimiento_id bigint,
    usuario_id bigint,
    fecha date DEFAULT CURRENT_DATE,
    referencia character varying(120),
    activo boolean DEFAULT true
);


ALTER TABLE public.movimiento_inventario OWNER TO admin;

--
-- Name: movimiento_inventario_detalle; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.movimiento_inventario_detalle (
    id_movi_invd bigint NOT NULL,
    movimiento_inventario_id bigint,
    producto_id bigint,
    cantidad numeric(18,4),
    costo_unitario numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.movimiento_inventario_detalle OWNER TO admin;

--
-- Name: movimiento_inventario_detalle_id_movi_invd_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.movimiento_inventario_detalle_id_movi_invd_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.movimiento_inventario_detalle_id_movi_invd_seq OWNER TO admin;

--
-- Name: movimiento_inventario_detalle_id_movi_invd_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.movimiento_inventario_detalle_id_movi_invd_seq OWNED BY public.movimiento_inventario_detalle.id_movi_invd;


--
-- Name: movimiento_inventario_id_movimientos_inventario_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.movimiento_inventario_id_movimientos_inventario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.movimiento_inventario_id_movimientos_inventario_seq OWNER TO admin;

--
-- Name: movimiento_inventario_id_movimientos_inventario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.movimiento_inventario_id_movimientos_inventario_seq OWNED BY public.movimiento_inventario.id_movimientos_inventario;


--
-- Name: pago; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pago (
    id_pagos bigint NOT NULL,
    numero_documento character varying(20) NOT NULL,
    proveedor_id bigint,
    usuario_id bigint,
    fecha date DEFAULT CURRENT_DATE,
    monto numeric(18,2),
    metodo_pago character varying(40),
    activo boolean DEFAULT true
);


ALTER TABLE public.pago OWNER TO admin;

--
-- Name: pago_detalle; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pago_detalle (
    id_pago_detalle bigint NOT NULL,
    pago_id bigint,
    compra_id bigint,
    monto_aplicado numeric(18,2),
    activo boolean DEFAULT true
);


ALTER TABLE public.pago_detalle OWNER TO admin;

--
-- Name: pago_detalle_id_pago_detalle_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.pago_detalle_id_pago_detalle_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pago_detalle_id_pago_detalle_seq OWNER TO admin;

--
-- Name: pago_detalle_id_pago_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.pago_detalle_id_pago_detalle_seq OWNED BY public.pago_detalle.id_pago_detalle;


--
-- Name: pago_id_pagos_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.pago_id_pagos_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pago_id_pagos_seq OWNER TO admin;

--
-- Name: pago_id_pagos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.pago_id_pagos_seq OWNED BY public.pago.id_pagos;


--
-- Name: producto_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.producto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producto_id_seq OWNER TO admin;

--
-- Name: producto; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.producto (
    id_productos bigint DEFAULT nextval('public.producto_id_seq'::regclass) NOT NULL,
    sku character varying(60) NOT NULL,
    nombre character varying(160) NOT NULL,
    departamento_id bigint,
    grupo_id bigint,
    unidad character varying(20),
    precio_venta numeric(18,2) DEFAULT 0,
    costo numeric(18,4) DEFAULT 0,
    stock numeric(18,4) DEFAULT 0,
    stock_min numeric(18,4) DEFAULT 0,
    ubicacion_id bigint,
    activo boolean DEFAULT true
);


ALTER TABLE public.producto OWNER TO admin;

--
-- Name: producto_id_productos_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.producto_id_productos_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.producto_id_productos_seq OWNER TO admin;

--
-- Name: producto_id_productos_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.producto_id_productos_seq OWNED BY public.producto.id_productos;


--
-- Name: proveedor; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.proveedor (
    id_proveedores bigint NOT NULL,
    nombre character varying(160) NOT NULL,
    rnc character varying(40),
    email character varying(120),
    telefono character varying(40),
    direccion character varying(255),
    activo boolean DEFAULT true
);


ALTER TABLE public.proveedor OWNER TO admin;

--
-- Name: proveedor_id_proveedores_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.proveedor_id_proveedores_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proveedor_id_proveedores_seq OWNER TO admin;

--
-- Name: proveedor_id_proveedores_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.proveedor_id_proveedores_seq OWNED BY public.proveedor.id_proveedores;


--
-- Name: role; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.role (
    id_roles bigint NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255),
    activo boolean DEFAULT true
);


ALTER TABLE public.role OWNER TO admin;

--
-- Name: role_id_roles_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.role_id_roles_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_id_roles_seq OWNER TO admin;

--
-- Name: role_id_roles_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.role_id_roles_seq OWNED BY public.role.id_roles;


--
-- Name: seq_movimiento_inventario; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.seq_movimiento_inventario
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.seq_movimiento_inventario OWNER TO admin;

--
-- Name: tipo_movimiento; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.tipo_movimiento (
    id_tipos_movimiento bigint NOT NULL,
    nombre character varying(80) NOT NULL,
    clase character varying(7),
    descripcion character varying(255),
    activo boolean DEFAULT true,
    CONSTRAINT tipo_movimiento_clase_check CHECK (((clase)::text = ANY ((ARRAY['ENTRADA'::character varying, 'SALIDA'::character varying])::text[])))
);


ALTER TABLE public.tipo_movimiento OWNER TO admin;

--
-- Name: tipo_movimiento_id_tipos_movimiento_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.tipo_movimiento_id_tipos_movimiento_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tipo_movimiento_id_tipos_movimiento_seq OWNER TO admin;

--
-- Name: tipo_movimiento_id_tipos_movimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.tipo_movimiento_id_tipos_movimiento_seq OWNED BY public.tipo_movimiento.id_tipos_movimiento;


--
-- Name: ubicacion; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.ubicacion (
    id_ubicaciones bigint NOT NULL,
    codigo character varying(40),
    nombre character varying(120),
    id_almacen bigint,
    activo boolean DEFAULT true
);


ALTER TABLE public.ubicacion OWNER TO admin;

--
-- Name: ubicacion_id_ubicaciones_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.ubicacion_id_ubicaciones_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ubicacion_id_ubicaciones_seq OWNER TO admin;

--
-- Name: ubicacion_id_ubicaciones_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.ubicacion_id_ubicaciones_seq OWNED BY public.ubicacion.id_ubicaciones;


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.usuario (
    id_usuarios bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    usuario character varying(50) NOT NULL,
    clave character varying(255) NOT NULL,
    id_rol bigint,
    activo boolean DEFAULT true,
    inv_productos boolean DEFAULT false,
    inv_almacenes boolean DEFAULT false,
    inv_ubicaciones boolean DEFAULT false,
    inv_departamentos boolean DEFAULT false,
    inv_grupos boolean DEFAULT false,
    inv_cotizaciones boolean DEFAULT false,
    inv_compras boolean DEFAULT false,
    inv_movimientos boolean DEFAULT false,
    inv_devoluciones boolean DEFAULT false,
    inv_facturacion boolean DEFAULT false,
    inv_consultas boolean DEFAULT false,
    inv_reportes boolean DEFAULT false,
    cxc_clientes boolean DEFAULT false,
    cxc_cobros boolean DEFAULT false,
    cxp_proveedores boolean DEFAULT false,
    cxp_pagos boolean DEFAULT false,
    conf_usuario boolean DEFAULT false,
    conf_roles boolean DEFAULT false,
    conf_empresa boolean DEFAULT false,
    conf_moneda boolean DEFAULT false,
    conf_condicion boolean DEFAULT false
);


ALTER TABLE public.usuario OWNER TO admin;

--
-- Name: usuario_id_usuarios_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.usuario_id_usuarios_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuario_id_usuarios_seq OWNER TO admin;

--
-- Name: usuario_id_usuarios_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.usuario_id_usuarios_seq OWNED BY public.usuario.id_usuarios;


--
-- Name: almacen id_almacen; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.almacen ALTER COLUMN id_almacen SET DEFAULT nextval('public.almacen_id_almacen_seq'::regclass);


--
-- Name: cliente id_clientes; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cliente ALTER COLUMN id_clientes SET DEFAULT nextval('public.cliente_id_clientes_seq'::regclass);


--
-- Name: cobro id_cobros; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro ALTER COLUMN id_cobros SET DEFAULT nextval('public.cobro_id_cobros_seq'::regclass);


--
-- Name: cobro_detalle id_cobro_detalle; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro_detalle ALTER COLUMN id_cobro_detalle SET DEFAULT nextval('public.cobro_detalle_id_cobro_detalle_seq'::regclass);


--
-- Name: compra id_compras; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra ALTER COLUMN id_compras SET DEFAULT nextval('public.compra_id_compras_seq'::regclass);


--
-- Name: compra_detalle id_compra_detalle; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra_detalle ALTER COLUMN id_compra_detalle SET DEFAULT nextval('public.compra_detalle_id_compra_detalle_seq'::regclass);


--
-- Name: condicion_pago id_condiciones_pago; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.condicion_pago ALTER COLUMN id_condiciones_pago SET DEFAULT nextval('public.condicion_pago_id_condiciones_pago_seq'::regclass);


--
-- Name: cotizacion id_cotizaciones; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion ALTER COLUMN id_cotizaciones SET DEFAULT nextval('public.cotizacion_id_cotizaciones_seq'::regclass);


--
-- Name: cotizacion_detalle id_cotizacion_detalle; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion_detalle ALTER COLUMN id_cotizacion_detalle SET DEFAULT nextval('public.cotizacion_detalle_id_cotizacion_detalle_seq'::regclass);


--
-- Name: departamento id_departamentos; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.departamento ALTER COLUMN id_departamentos SET DEFAULT nextval('public.departamento_id_departamentos_seq'::regclass);


--
-- Name: devolucion id_devoluciones; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.devolucion ALTER COLUMN id_devoluciones SET DEFAULT nextval('public.devolucion_id_devoluciones_seq'::regclass);


--
-- Name: empresa id_empresa; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresa_id_empresa_seq'::regclass);


--
-- Name: factura id_facturas; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura ALTER COLUMN id_facturas SET DEFAULT nextval('public.factura_id_facturas_seq'::regclass);


--
-- Name: factura_detalle id_factura_detalle; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura_detalle ALTER COLUMN id_factura_detalle SET DEFAULT nextval('public.factura_detalle_id_factura_detalle_seq'::regclass);


--
-- Name: grupo id_grupos; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.grupo ALTER COLUMN id_grupos SET DEFAULT nextval('public.grupo_id_grupos_seq'::regclass);


--
-- Name: moneda id_monedas; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.moneda ALTER COLUMN id_monedas SET DEFAULT nextval('public.moneda_id_monedas_seq'::regclass);


--
-- Name: movimiento_inventario id_movimientos_inventario; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario ALTER COLUMN id_movimientos_inventario SET DEFAULT nextval('public.movimiento_inventario_id_movimientos_inventario_seq'::regclass);


--
-- Name: movimiento_inventario_detalle id_movi_invd; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario_detalle ALTER COLUMN id_movi_invd SET DEFAULT nextval('public.movimiento_inventario_detalle_id_movi_invd_seq'::regclass);


--
-- Name: pago id_pagos; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pagos SET DEFAULT nextval('public.pago_id_pagos_seq'::regclass);


--
-- Name: pago_detalle id_pago_detalle; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago_detalle ALTER COLUMN id_pago_detalle SET DEFAULT nextval('public.pago_detalle_id_pago_detalle_seq'::regclass);


--
-- Name: proveedor id_proveedores; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.proveedor ALTER COLUMN id_proveedores SET DEFAULT nextval('public.proveedor_id_proveedores_seq'::regclass);


--
-- Name: role id_roles; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role ALTER COLUMN id_roles SET DEFAULT nextval('public.role_id_roles_seq'::regclass);


--
-- Name: tipo_movimiento id_tipos_movimiento; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tipo_movimiento ALTER COLUMN id_tipos_movimiento SET DEFAULT nextval('public.tipo_movimiento_id_tipos_movimiento_seq'::regclass);


--
-- Name: ubicacion id_ubicaciones; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.ubicacion ALTER COLUMN id_ubicaciones SET DEFAULT nextval('public.ubicacion_id_ubicaciones_seq'::regclass);


--
-- Name: usuario id_usuarios; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_usuarios SET DEFAULT nextval('public.usuario_id_usuarios_seq'::regclass);


--
-- Data for Name: almacen; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.almacen (id_almacen, codigo, nombre, activo) FROM stdin;
1	ALM-001	Almacén Principal	t
2	ALM-002	Almacén Secundario	t
3	ALM-003	Almacén de Tienda	t
4	ALM-004	Almacen Navarrete City	t
\.


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cliente (id_clientes, nombre, doc_identidad, email, telefono, direccion, activo) FROM stdin;
1	Juan Pérez	40212345678	juanp@example.com	809-555-1000	Santo Domingo	t
2	María López	00112345612	marial@example.com	809-555-2000	Santiago	t
4	Bodega El Buen Precios	40298765432	bodega@example.com	809-555-4000	San Cristóbal	t
3	Supermercado La Económia	132456789	contacto@laeconomica.com	809-555-3000	La Vega	t
5	Erik Cruz	402213145	erikrdbs@gmail.com	829-391-4438	C/ DURO	t
\.


--
-- Data for Name: cobro; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cobro (id_cobros, numero_documento, cliente_id, usuario_id, fecha, monto, metodo_pago, activo) FROM stdin;
\.


--
-- Data for Name: cobro_detalle; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cobro_detalle (id_cobro_detalle, cobro_id, factura_id, monto_aplicado, activo) FROM stdin;
\.


--
-- Data for Name: compra; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.compra (id_compras, numero_documento, proveedor_id, usuario_id, fecha, total, activo, saldo) FROM stdin;
2	000001	4	3	2025-12-10	190.00	t	190.00
3	000002	4	3	2025-12-10	155.00	t	155.00
4	000003	4	3	2025-12-10	90.00	t	90.00
5	000004	4	3	2025-12-10	190.00	t	190.00
6	000005	4	3	2025-12-10	190.00	t	190.00
7	000006	5	3	2025-12-10	240.00	t	240.00
8	000007	3	3	2025-12-10	77500.00	t	77500.00
9	000008	5	3	2025-12-10	155.00	t	155.00
10	000009	5	3	2025-12-11	1000.00	t	1000.00
11	000010	4	3	2025-12-11	190.00	t	190.00
12	000011	1	3	2025-12-11	85.00	t	85.00
13	000012	4	3	2025-12-12	360.00	t	360.00
\.


--
-- Data for Name: compra_detalle; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.compra_detalle (id_compra_detalle, compra_id, producto_id, cantidad, costo_unitario, activo) FROM stdin;
2	2	5	1.0000	190.00	t
3	3	6	1.0000	155.00	t
4	4	8	1.0000	90.00	t
5	5	5	1.0000	190.00	t
6	6	5	1.0000	190.00	t
7	7	6	1.0000	155.00	t
8	7	4	1.0000	85.00	t
9	8	6	500.0000	155.00	t
10	9	6	1.0000	155.00	t
11	10	9	1.0000	1000.00	t
12	11	5	1.0000	190.00	t
13	12	4	1.0000	85.00	t
14	13	8	4.0000	90.00	t
\.


--
-- Data for Name: condicion_pago; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.condicion_pago (id_condiciones_pago, nombre, dias_plazo, activo) FROM stdin;
3	Contado	0	t
4	Crédito 7 días	7	t
5	Crédito 15 días	15	t
6	Crédito 30 días	30	t
7	Crédito 60 días	60	t
\.


--
-- Data for Name: cotizacion; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cotizacion (id_cotizaciones, cliente_id, usuario_id, fecha, total, activo) FROM stdin;
1	5	1	2025-12-03	8250.00	t
\.


--
-- Data for Name: cotizacion_detalle; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.cotizacion_detalle (id_cotizacion_detalle, cotizacion_id, producto_id, cantidad, precio_unitario, activo) FROM stdin;
1	1	9	5.0000	1500.00	t
2	1	8	5.0000	150.00	t
\.


--
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.departamento (id_departamentos, nombre, activo) FROM stdin;
1	Comestibles	t
3	Lácteos	t
4	Carnes	t
5	Hogar	t
6	Limpieza	t
7	Electrónica	t
8	Ferretería	t
2	Bebidas	t
9	Deportes	t
\.


--
-- Data for Name: devolucion; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.devolucion (id_devoluciones, numero_documento, factura_id, usuario_id, fecha, total, activo) FROM stdin;
\.


--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.empresa (id_empresa, nombre, rnc, direccion, telefono, email, logo_url, moneda_base_id) FROM stdin;
1	Yankees Corpa	40212314531	C/ Santiago Mexic	8095855377	Yankees@gmail.com	https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/New_York_Yankees_Primary_Logo.svg/250px-New_York_Yankees_Primary_Logo.svg.png	2
\.


--
-- Data for Name: factura; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.factura (id_facturas, numero_documento, cliente_id, usuario_id, fecha, condicion_id, total, activo, saldo, estado) FROM stdin;
3	000001	1	1	2025-12-03	4	8250.00	t	8250.00	PENDIENTE
19	000002	5	1	2025-12-10	3	320.00	t	0.00	PAGADA
20	000003	5	1	2025-12-10	3	700.00	t	0.00	PAGADA
21	000004	4	1	2025-12-10	3	120.00	t	0.00	PAGADA
22	000005	4	1	2025-12-10	3	240.00	t	0.00	PAGADA
23	000006	5	1	2025-12-10	3	240.00	t	0.00	PAGADA
24	000007	5	1	2025-12-10	4	240.00	t	240.00	PENDIENTE
25	000008	2	1	2025-12-10	3	3160.00	t	0.00	PAGADA
26	000009	5	1	2025-12-10	3	1050.00	t	0.00	PAGADA
27	000010	5	1	2025-12-10	3	120.00	t	0.00	PAGADA
28	000011	2	1	2025-12-11	3	470.00	t	0.00	PAGADA
30	000012	5	1	2025-12-12	3	300.00	t	0.00	PAGADA
46	000013	5	1	2025-12-12	3	240.00	t	0.00	PAGADA
47	000014	5	1	2025-12-12	3	1775.00	t	0.00	PAGADA
48	000015	5	1	2025-12-13	3	700.00	t	0.00	PAGADA
\.


--
-- Data for Name: factura_detalle; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.factura_detalle (id_factura_detalle, factura_id, producto_id, cantidad, precio_unitario, activo) FROM stdin;
1	3	9	5.0000	1500.00	t
2	3	8	5.0000	150.00	t
10	19	4	1.0000	120.00	t
11	19	6	1.0000	200.00	t
12	20	1	2.0000	350.00	t
13	21	4	1.0000	120.00	t
14	22	4	2.0000	120.00	t
15	23	4	2.0000	120.00	t
16	24	4	2.0000	120.00	t
17	25	4	1.0000	120.00	t
18	25	6	1.0000	200.00	t
19	25	7	4.0000	275.00	t
20	25	9	1.0000	1500.00	t
21	25	5	1.0000	240.00	t
22	26	1	3.0000	350.00	t
23	27	4	1.0000	120.00	t
24	28	1	1.0000	350.00	t
25	28	4	1.0000	120.00	t
26	30	8	2.0000	150.00	t
27	46	4	2.0000	120.00	t
28	47	2	1.0000	75.00	t
29	47	6	1.0000	200.00	t
30	47	9	1.0000	1500.00	t
31	48	1	2.0000	350.00	t
\.


--
-- Data for Name: grupo; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.grupo (id_grupos, departamento_id, nombre, activo) FROM stdin;
1	1	Enlatados	t
2	1	Granos	t
3	2	Refrescos	t
4	2	Alcohol	t
5	3	Quesos	t
6	3	Yogures	t
7	4	Res	t
8	4	Pollo	t
9	5	Plásticos	t
10	5	Cocina	t
11	7	Accesorios	t
12	8	Herramientas	t
13	4	Cerdo	t
\.


--
-- Data for Name: moneda; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.moneda (id_monedas, codigo, nombre, simbolo, tasa_cambio, es_base, activo) FROM stdin;
1	DOP	Peso Dominicano	$	1.000000	t	t
2	USD	Dolar Estadounidense	$	62.000000	f	t
\.


--
-- Data for Name: movimiento_inventario; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.movimiento_inventario (id_movimientos_inventario, numero_documento, tipo_movimiento_id, usuario_id, fecha, referencia, activo) FROM stdin;
1	MOV-000001	2	1	2025-12-12	FACTURA 000012	t
2	MOV-000002	2	1	2025-12-12	FACTURA 000013	t
3	MOV-000003	2	1	2025-12-12	FACTURA 000014	t
4	MOV-000004	1	3	2025-12-12	COMPRA 000012	t
5	AJU-000001	2	1	2025-12-13	Salida de producto por rotura	t
6	AJU-000002	2	1	2025-12-13	Si	t
7	AJU-000003	2	1	2025-12-13		t
8	AJU-000004	2	1	2025-12-13	SIii	t
9	AJU-000005	2	1	2025-12-13	SIii	t
10	AJU-000006	2	1	2025-12-13	asdas	t
11	AJU-000007	1	1	2025-12-13	Entrada	t
12	AJU-000008	3	1	2025-12-13	Si	t
13	AJU-000009	3	1	2025-12-13		t
14	AJU-000010	3	1	2025-12-13	Si	t
15	AJU-000011	4	1	2025-12-13	Si	t
16	MOV-000016	2	1	2025-12-13	FACTURA 000015	t
17	AJU-000012	3	1	2025-12-13	a	t
\.


--
-- Data for Name: movimiento_inventario_detalle; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.movimiento_inventario_detalle (id_movi_invd, movimiento_inventario_id, producto_id, cantidad, costo_unitario, activo) FROM stdin;
1	1	8	-2.0000	0.00	t
2	2	4	-2.0000	0.00	t
3	3	2	-1.0000	55.00	t
4	3	6	-1.0000	155.00	t
5	3	9	-1.0000	1000.00	t
6	4	8	4.0000	90.00	t
7	5	8	-2.0000	\N	t
8	6	4	-5.0000	\N	t
9	7	4	-50.0000	\N	t
10	8	6	-20.0000	\N	t
11	8	5	-20.0000	\N	t
12	9	6	-20.0000	\N	t
13	9	5	-20.0000	\N	t
14	10	3	-10.0000	\N	t
15	10	7	-10.0000	\N	t
16	11	6	-50.0000	\N	t
17	12	6	10.0000	\N	t
18	13	6	10.0000	\N	t
19	14	6	10.0000	\N	t
20	14	3	10.0000	\N	t
21	15	6	-10.0000	\N	t
22	16	1	-2.0000	250.00	t
23	17	6	10.0000	\N	t
\.


--
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pago (id_pagos, numero_documento, proveedor_id, usuario_id, fecha, monto, metodo_pago, activo) FROM stdin;
\.


--
-- Data for Name: pago_detalle; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.pago_detalle (id_pago_detalle, pago_id, compra_id, monto_aplicado, activo) FROM stdin;
\.


--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.producto (id_productos, sku, nombre, departamento_id, grupo_id, unidad, precio_venta, costo, stock, stock_min, ubicacion_id, activo) FROM stdin;
4	SKU-COC2L	Coca-Cola 2L	2	3	UND	120.00	85.0000	24.0000	10.0000	2	t
5	SKU-CHED	Queso Cheddar 1lb	3	5	UND	240.00	190.0000	3.0000	5.0000	5	t
7	SKU-WD40	W40 Aceite Penetrante	6	12	UND	275.00	210.0000	11.0000	3.0000	3	t
3	SKU-AG16	El Natural – Agua 16oz	2	3	UND	15.00	8.0000	300.0000	30.0000	2	t
1	SKU-ARZ10	Arroz Premium 10lb	1	2	UND	350.00	250.0000	112.0000	10.0000	1	t
6	SKU-POLL1	Pollo Entero	4	8	UND	200.00	155.0000	500.0000	6.0000	5	t
2	SKU-HAB440	Habichuelas Rojas 440g	1	2	UND	75.00	55.0000	199.0000	20.0000	1	t
9	SKU-TEFL	TELFONO	7	12	UND	1500.00	1000.0000	44.0000	10.0000	1	t
8	SKU-USBTC	Cargador USB Tipo C	7	11	UND	150.00	90.0000	46.0000	5.0000	6	t
\.


--
-- Data for Name: proveedor; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.proveedor (id_proveedores, nombre, rnc, email, telefono, direccion, activo) FROM stdin;
2	Bebidas Nacionales SRL	101556987	contacto@bebidasnac.com	809-555-2222	Santiago	t
3	Agroindustrial Dominicana	130987654	ventas@agrodom.com	809-555-3333	La Vega	t
4	Tecnología Expresz	110223344	info@tecexpress.com	809-555-4444	Santo Domingo	t
1	Mercantil Distributor	131441234	ventas@mercantil.com	809-555-1111	Santo Domingo	t
5	LA YUC	1231231231	lacabra@gmail.com	8299599496	C/ SANTIAGOS	t
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.role (id_roles, nombre, descripcion, activo) FROM stdin;
1	Administrador	Acceso total al sistema	t
2	Usuario	Acceso limitado	t
3	Usuari min	Usuario minimo	f
\.


--
-- Data for Name: tipo_movimiento; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.tipo_movimiento (id_tipos_movimiento, nombre, clase, descripcion, activo) FROM stdin;
1	COMPRA	ENTRADA	Entrada por compra	t
2	VENTA	SALIDA	Salida por venta	t
3	AJUSTE_POS	ENTRADA	Ajuste positivo	t
5	TRANSFERENCIA	SALIDA	Transferencia entre almacenes	t
4	AJUSTE_NEG	SALIDA	Ajuste negativ	t
\.


--
-- Data for Name: ubicacion; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.ubicacion (id_ubicaciones, codigo, nombre, id_almacen, activo) FROM stdin;
2	B1	Pasillo B	1	t
3	R1	Rack 1	2	t
5	M1	Mostrador	3	t
6	D1	Mini Depósito	3	t
1	A1	Pasillo A	1	f
4	R2	Rack 2	1	f
7	C1	Pasillo C	1	t
\.


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.usuario (id_usuarios, nombre, usuario, clave, id_rol, activo, inv_productos, inv_almacenes, inv_ubicaciones, inv_departamentos, inv_grupos, inv_cotizaciones, inv_compras, inv_movimientos, inv_devoluciones, inv_facturacion, inv_consultas, inv_reportes, cxc_clientes, cxc_cobros, cxp_proveedores, cxp_pagos, conf_usuario, conf_roles, conf_empresa, conf_moneda, conf_condicion) FROM stdin;
3	Danielito Myers	admin	admin123	1	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t	t
1	Fellito Lope	Fellito	Fellito123	1	t	t	t	t	t	t	f	f	f	f	f	f	f	f	f	f	f	t	t	t	t	t
4	PEDRO STRO	PEDRO	PEDRO123	2	t	t	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
\.


--
-- Name: almacen_id_almacen_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.almacen_id_almacen_seq', 4, true);


--
-- Name: cliente_id_clientes_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cliente_id_clientes_seq', 5, true);


--
-- Name: cobro_detalle_id_cobro_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cobro_detalle_id_cobro_detalle_seq', 1, false);


--
-- Name: cobro_id_cobros_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cobro_id_cobros_seq', 1, false);


--
-- Name: compra_detalle_id_compra_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.compra_detalle_id_compra_detalle_seq', 14, true);


--
-- Name: compra_id_compras_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.compra_id_compras_seq', 13, true);


--
-- Name: condicion_pago_id_condiciones_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.condicion_pago_id_condiciones_pago_seq', 7, true);


--
-- Name: cotizacion_detalle_id_cotizacion_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cotizacion_detalle_id_cotizacion_detalle_seq', 2, true);


--
-- Name: cotizacion_id_cotizaciones_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.cotizacion_id_cotizaciones_seq', 1, true);


--
-- Name: departamento_id_departamentos_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.departamento_id_departamentos_seq', 9, true);


--
-- Name: devolucion_id_devoluciones_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.devolucion_id_devoluciones_seq', 1, false);


--
-- Name: empresa_id_empresa_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.empresa_id_empresa_seq', 1, true);


--
-- Name: factura_detalle_id_factura_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.factura_detalle_id_factura_detalle_seq', 31, true);


--
-- Name: factura_id_facturas_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.factura_id_facturas_seq', 48, true);


--
-- Name: grupo_id_grupos_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.grupo_id_grupos_seq', 13, true);


--
-- Name: moneda_id_monedas_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.moneda_id_monedas_seq', 2, true);


--
-- Name: movimiento_inventario_detalle_id_movi_invd_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.movimiento_inventario_detalle_id_movi_invd_seq', 23, true);


--
-- Name: movimiento_inventario_id_movimientos_inventario_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.movimiento_inventario_id_movimientos_inventario_seq', 17, true);


--
-- Name: pago_detalle_id_pago_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.pago_detalle_id_pago_detalle_seq', 1, false);


--
-- Name: pago_id_pagos_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.pago_id_pagos_seq', 1, false);


--
-- Name: producto_id_productos_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.producto_id_productos_seq', 2, true);


--
-- Name: producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.producto_id_seq', 9, true);


--
-- Name: proveedor_id_proveedores_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.proveedor_id_proveedores_seq', 5, true);


--
-- Name: role_id_roles_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.role_id_roles_seq', 3, true);


--
-- Name: seq_movimiento_inventario; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.seq_movimiento_inventario', 12, true);


--
-- Name: tipo_movimiento_id_tipos_movimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.tipo_movimiento_id_tipos_movimiento_seq', 5, true);


--
-- Name: ubicacion_id_ubicaciones_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.ubicacion_id_ubicaciones_seq', 7, true);


--
-- Name: usuario_id_usuarios_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.usuario_id_usuarios_seq', 4, true);


--
-- Name: almacen almacen_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.almacen
    ADD CONSTRAINT almacen_pkey PRIMARY KEY (id_almacen);


--
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_clientes);


--
-- Name: cobro_detalle cobro_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro_detalle
    ADD CONSTRAINT cobro_detalle_pkey PRIMARY KEY (id_cobro_detalle);


--
-- Name: cobro cobro_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro
    ADD CONSTRAINT cobro_numero_documento_key UNIQUE (numero_documento);


--
-- Name: cobro cobro_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro
    ADD CONSTRAINT cobro_pkey PRIMARY KEY (id_cobros);


--
-- Name: compra_detalle compra_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra_detalle
    ADD CONSTRAINT compra_detalle_pkey PRIMARY KEY (id_compra_detalle);


--
-- Name: compra compra_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT compra_numero_documento_key UNIQUE (numero_documento);


--
-- Name: compra compra_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT compra_pkey PRIMARY KEY (id_compras);


--
-- Name: condicion_pago condicion_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.condicion_pago
    ADD CONSTRAINT condicion_pago_pkey PRIMARY KEY (id_condiciones_pago);


--
-- Name: cotizacion_detalle cotizacion_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion_detalle
    ADD CONSTRAINT cotizacion_detalle_pkey PRIMARY KEY (id_cotizacion_detalle);


--
-- Name: cotizacion cotizacion_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_pkey PRIMARY KEY (id_cotizaciones);


--
-- Name: departamento departamento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_nombre_key UNIQUE (nombre);


--
-- Name: departamento departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_pkey PRIMARY KEY (id_departamentos);


--
-- Name: devolucion devolucion_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.devolucion
    ADD CONSTRAINT devolucion_numero_documento_key UNIQUE (numero_documento);


--
-- Name: devolucion devolucion_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.devolucion
    ADD CONSTRAINT devolucion_pkey PRIMARY KEY (id_devoluciones);


--
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa);


--
-- Name: factura_detalle factura_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura_detalle
    ADD CONSTRAINT factura_detalle_pkey PRIMARY KEY (id_factura_detalle);


--
-- Name: factura factura_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_numero_documento_key UNIQUE (numero_documento);


--
-- Name: factura factura_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_pkey PRIMARY KEY (id_facturas);


--
-- Name: grupo grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_pkey PRIMARY KEY (id_grupos);


--
-- Name: moneda moneda_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.moneda
    ADD CONSTRAINT moneda_pkey PRIMARY KEY (id_monedas);


--
-- Name: movimiento_inventario_detalle movimiento_inventario_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario_detalle
    ADD CONSTRAINT movimiento_inventario_detalle_pkey PRIMARY KEY (id_movi_invd);


--
-- Name: movimiento_inventario movimiento_inventario_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT movimiento_inventario_numero_documento_key UNIQUE (numero_documento);


--
-- Name: movimiento_inventario movimiento_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT movimiento_inventario_pkey PRIMARY KEY (id_movimientos_inventario);


--
-- Name: pago_detalle pago_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago_detalle
    ADD CONSTRAINT pago_detalle_pkey PRIMARY KEY (id_pago_detalle);


--
-- Name: pago pago_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_numero_documento_key UNIQUE (numero_documento);


--
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pagos);


--
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (id_productos);


--
-- Name: producto producto_sku_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_sku_key UNIQUE (sku);


--
-- Name: proveedor proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.proveedor
    ADD CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedores);


--
-- Name: role role_nombre_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_nombre_key UNIQUE (nombre);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id_roles);


--
-- Name: tipo_movimiento tipo_movimiento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tipo_movimiento
    ADD CONSTRAINT tipo_movimiento_nombre_key UNIQUE (nombre);


--
-- Name: tipo_movimiento tipo_movimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tipo_movimiento
    ADD CONSTRAINT tipo_movimiento_pkey PRIMARY KEY (id_tipos_movimiento);


--
-- Name: ubicacion ubicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT ubicacion_pkey PRIMARY KEY (id_ubicaciones);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuarios);


--
-- Name: usuario usuario_usuario_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_usuario_key UNIQUE (usuario);


--
-- Name: cobro_detalle trg_actualizar_saldo_factura; Type: TRIGGER; Schema: public; Owner: admin
--

CREATE TRIGGER trg_actualizar_saldo_factura AFTER INSERT ON public.cobro_detalle FOR EACH ROW EXECUTE FUNCTION public.actualizar_saldo_factura();


--
-- Name: cobro cobro_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro
    ADD CONSTRAINT cobro_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id_clientes);


--
-- Name: cobro_detalle cobro_detalle_cobro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro_detalle
    ADD CONSTRAINT cobro_detalle_cobro_id_fkey FOREIGN KEY (cobro_id) REFERENCES public.cobro(id_cobros);


--
-- Name: cobro_detalle cobro_detalle_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro_detalle
    ADD CONSTRAINT cobro_detalle_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.factura(id_facturas);


--
-- Name: cobro cobro_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cobro
    ADD CONSTRAINT cobro_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuarios);


--
-- Name: compra_detalle compra_detalle_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra_detalle
    ADD CONSTRAINT compra_detalle_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compra(id_compras);


--
-- Name: compra_detalle compra_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra_detalle
    ADD CONSTRAINT compra_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id_productos);


--
-- Name: compra compra_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT compra_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedor(id_proveedores);


--
-- Name: compra compra_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.compra
    ADD CONSTRAINT compra_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuarios);


--
-- Name: cotizacion cotizacion_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id_clientes);


--
-- Name: cotizacion_detalle cotizacion_detalle_cotizacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion_detalle
    ADD CONSTRAINT cotizacion_detalle_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES public.cotizacion(id_cotizaciones);


--
-- Name: cotizacion_detalle cotizacion_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion_detalle
    ADD CONSTRAINT cotizacion_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id_productos);


--
-- Name: cotizacion cotizacion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cotizacion
    ADD CONSTRAINT cotizacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuarios);


--
-- Name: devolucion devolucion_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.devolucion
    ADD CONSTRAINT devolucion_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.factura(id_facturas);


--
-- Name: devolucion devolucion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.devolucion
    ADD CONSTRAINT devolucion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuarios);


--
-- Name: empresa empresa_moneda_base_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_moneda_base_id_fkey FOREIGN KEY (moneda_base_id) REFERENCES public.moneda(id_monedas);


--
-- Name: factura factura_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id_clientes);


--
-- Name: factura factura_condicion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_condicion_id_fkey FOREIGN KEY (condicion_id) REFERENCES public.condicion_pago(id_condiciones_pago);


--
-- Name: factura_detalle factura_detalle_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura_detalle
    ADD CONSTRAINT factura_detalle_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.factura(id_facturas);


--
-- Name: factura_detalle factura_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura_detalle
    ADD CONSTRAINT factura_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id_productos);


--
-- Name: factura factura_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuarios);


--
-- Name: grupo grupo_departamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.grupo
    ADD CONSTRAINT grupo_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id_departamentos);


--
-- Name: movimiento_inventario_detalle movimiento_inventario_detalle_movimiento_inventario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario_detalle
    ADD CONSTRAINT movimiento_inventario_detalle_movimiento_inventario_id_fkey FOREIGN KEY (movimiento_inventario_id) REFERENCES public.movimiento_inventario(id_movimientos_inventario);


--
-- Name: movimiento_inventario_detalle movimiento_inventario_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario_detalle
    ADD CONSTRAINT movimiento_inventario_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id_productos);


--
-- Name: movimiento_inventario movimiento_inventario_tipo_movimiento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT movimiento_inventario_tipo_movimiento_id_fkey FOREIGN KEY (tipo_movimiento_id) REFERENCES public.tipo_movimiento(id_tipos_movimiento);


--
-- Name: movimiento_inventario movimiento_inventario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movimiento_inventario
    ADD CONSTRAINT movimiento_inventario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuarios);


--
-- Name: pago_detalle pago_detalle_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago_detalle
    ADD CONSTRAINT pago_detalle_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compra(id_compras);


--
-- Name: pago_detalle pago_detalle_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago_detalle
    ADD CONSTRAINT pago_detalle_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES public.pago(id_pagos);


--
-- Name: pago pago_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedor(id_proveedores);


--
-- Name: pago pago_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id_usuarios);


--
-- Name: producto producto_departamento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_departamento_id_fkey FOREIGN KEY (departamento_id) REFERENCES public.departamento(id_departamentos);


--
-- Name: producto producto_grupo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupo(id_grupos);


--
-- Name: producto producto_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_ubicacion_id_fkey FOREIGN KEY (ubicacion_id) REFERENCES public.ubicacion(id_ubicaciones);


--
-- Name: ubicacion ubicacion_id_almacen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT ubicacion_id_almacen_fkey FOREIGN KEY (id_almacen) REFERENCES public.almacen(id_almacen);


--
-- Name: usuario usuario_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.role(id_roles);


--
-- PostgreSQL database dump complete
--

\unrestrict cOLeZGOfv0HyH2hogP5CtWEZnuULnfUZq86glMuyBqaKgtOK710kDE3tyHWZzY7

