-- ==========================
-- TABLA: productos
-- ==========================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_costo NUMERIC(10, 2) NOT NULL CHECK (precio_costo >= 0),
    precio_venta NUMERIC(10, 2) NOT NULL CHECK (precio_venta >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- ==========================
-- TABLA: clientes
-- ==========================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- ==========================
-- TABLA: ventas (cabecera)
-- ==========================
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    fecha TIMESTAMP DEFAULT NOW(),
    total NUMERIC(10, 2) NOT NULL,           -- suma de todos los productos vendidos
    monto_pagado NUMERIC(10, 2) NOT NULL DEFAULT 0,  -- lo que pagó de contado
    monto_fiado NUMERIC(10, 2) NOT NULL DEFAULT 0    -- lo que quedó a deber (total - monto_pagado)
);

-- ==========================
-- TABLA: detalle_ventas
-- ==========================
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL,   -- precio de venta al momento de vender
    costo_unitario NUMERIC(10, 2) NOT NULL     -- precio de costo al momento de vender (para calcular ganancia real)
);

-- ==========================
-- TABLA: deudas
-- ==========================
CREATE TABLE deudas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id),
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    monto_original NUMERIC(10, 2) NOT NULL,
    monto_pendiente NUMERIC(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_vencimiento DATE,                     -- ej: para "el mes siguiente"
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada'))
);

-- ==========================
-- TABLA: abonos
-- ==========================
CREATE TABLE abonos (
    id SERIAL PRIMARY KEY,
    deuda_id INTEGER NOT NULL REFERENCES deudas(id) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha TIMESTAMP DEFAULT NOW()
);