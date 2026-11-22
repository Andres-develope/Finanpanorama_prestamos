-- ============================================
-- PRESTAFÁCIL - SISTEMA DE PRÉSTAMOS
-- Base de datos MySQL
-- ============================================

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS prestafacil
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. Usar la base de datos
USE prestafacil;

-- ============================================
-- TABLA: clientes
-- Datos del deudor y préstamo
-- ============================================
DROP TABLE IF EXISTS audit_trail;
DROP TABLE IF EXISTS clientes;

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Datos personales
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    tipo_documento ENUM('CC', 'CE', 'PA') DEFAULT 'CC',
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    celular VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    empresa VARCHAR(150) NULL,
    
    -- Referencia personal (opcional)
    ref_nombre VARCHAR(150) NULL,
    ref_celular VARCHAR(20) NULL,
    ref_parentesco VARCHAR(50) NULL,
    
    -- Préstamo
    cantidad DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Estado y firma
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    firma_digital LONGTEXT NULL,
    documento_firmado BOOLEAN DEFAULT FALSE,
    fecha_firma DATETIME NULL,
    identificador_unico VARCHAR(100) NULL,
    ip_firma VARCHAR(45) NULL,
    
    -- Timestamps
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_estado (estado),
    INDEX idx_documento (numero_documento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLA: audit_trail
-- Historial de eventos
-- ============================================
CREATE TABLE audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- VERIFICAR
-- ============================================
SHOW TABLES;
SELECT 'Base de datos prestafacil creada correctamente!' AS mensaje;
