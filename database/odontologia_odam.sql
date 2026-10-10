CREATE DATABASE IF NOT EXISTS odontologia_odam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE odontologia_odam;

CREATE TABLE roles (
 id_rol INT AUTO_INCREMENT PRIMARY KEY,
 nombre_rol VARCHAR(50) NOT NULL UNIQUE,
 descripcion VARCHAR(255),
 estado BOOLEAN DEFAULT TRUE
);
CREATE TABLE usuarios (
 id_usuario INT AUTO_INCREMENT PRIMARY KEY,
 nombre_usuario VARCHAR(100), correo VARCHAR(150) UNIQUE,
 contrasena VARCHAR(255) NOT NULL, estado BOOLEAN DEFAULT TRUE,
 fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
 fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 id_rol INT NOT NULL,
 CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE TABLE pacientes (
 id_paciente INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT UNIQUE NULL,
 nombres VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL,
 documento VARCHAR(30) NOT NULL UNIQUE, telefono VARCHAR(30), correo VARCHAR(150),
 fecha_nacimiento DATE, direccion VARCHAR(255), sexo VARCHAR(30), fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_paciente_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
CREATE TABLE odontologos (
 id_odontologo INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT UNIQUE NULL,
 nombres VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL, especialidad VARCHAR(100),
 colegiatura VARCHAR(50) UNIQUE, telefono VARCHAR(30), correo VARCHAR(150), estado BOOLEAN DEFAULT TRUE,
 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
CREATE TABLE personal_administrativo (
 id_personal INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT UNIQUE NULL,
 nombres VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL, area VARCHAR(100) DEFAULT 'RECEPCION', telefono VARCHAR(30), estado BOOLEAN DEFAULT TRUE,
 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
CREATE TABLE marketing (
 id_marketing INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT UNIQUE NULL,
 nombres VARCHAR(100) NOT NULL, apellidos VARCHAR(100) NOT NULL, canal VARCHAR(100), estado BOOLEAN DEFAULT TRUE,
 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);
CREATE TABLE servicios (
 id_servicio INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(150) NOT NULL UNIQUE, descripcion VARCHAR(255), precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0), estado BOOLEAN DEFAULT TRUE
);
CREATE TABLE horarios (
 id_horario INT AUTO_INCREMENT PRIMARY KEY, id_odontologo INT NOT NULL, fecha DATE NOT NULL, hora_inicio TIME NOT NULL, hora_fin TIME NOT NULL,
 estado ENUM('DISPONIBLE','OCUPADO','BLOQUEADO') DEFAULT 'DISPONIBLE',
 UNIQUE KEY uq_horario (id_odontologo,fecha,hora_inicio,hora_fin), FOREIGN KEY (id_odontologo) REFERENCES odontologos(id_odontologo)
);
CREATE TABLE citas (
 id_cita INT AUTO_INCREMENT PRIMARY KEY, id_paciente INT NOT NULL, id_odontologo INT NOT NULL, id_personal INT NULL, id_servicio INT NOT NULL, id_horario INT UNIQUE NULL,
 fecha DATE NOT NULL, hora TIME NOT NULL, estado ENUM('PROGRAMADA','ATENDIDA','CANCELADA','REPROGRAMADA') DEFAULT 'PROGRAMADA', motivo VARCHAR(255), observaciones TEXT,
 fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP, fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente), FOREIGN KEY (id_odontologo) REFERENCES odontologos(id_odontologo), FOREIGN KEY (id_personal) REFERENCES personal_administrativo(id_personal), FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio), FOREIGN KEY (id_horario) REFERENCES horarios(id_horario)
);
CREATE TABLE historias_clinicas (
 id_historia INT AUTO_INCREMENT PRIMARY KEY, id_paciente INT NOT NULL UNIQUE, codigo VARCHAR(50) NOT NULL UNIQUE, fecha_creacion DATE DEFAULT (CURRENT_DATE), antecedentes TEXT, alergias TEXT, observaciones TEXT,
 FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
);
CREATE TABLE evaluaciones_clinicas (
 id_evaluacion INT AUTO_INCREMENT PRIMARY KEY, id_historia INT NOT NULL, id_odontologo INT NOT NULL, fecha DATE NOT NULL, diagnostico TEXT NOT NULL, observaciones TEXT, recomendaciones TEXT,
 FOREIGN KEY (id_historia) REFERENCES historias_clinicas(id_historia), FOREIGN KEY (id_odontologo) REFERENCES odontologos(id_odontologo)
);
CREATE TABLE tratamientos (
 id_tratamiento INT AUTO_INCREMENT PRIMARY KEY, id_historia INT NOT NULL, id_odontologo INT NOT NULL, id_servicio INT NOT NULL, fecha_inicio DATE NOT NULL, fecha_fin DATE NULL, diagnostico TEXT, descripcion TEXT,
 estado ENUM('PENDIENTE','EN_PROCESO','FINALIZADO','CANCELADO') DEFAULT 'PENDIENTE', CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
 FOREIGN KEY (id_historia) REFERENCES historias_clinicas(id_historia), FOREIGN KEY (id_odontologo) REFERENCES odontologos(id_odontologo), FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);
CREATE TABLE pagos (
 id_pago INT AUTO_INCREMENT PRIMARY KEY, id_paciente INT NOT NULL, id_cita INT NULL, id_servicio INT NOT NULL, monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
 metodo_pago ENUM('EFECTIVO','TARJETA','YAPE','PLIN','TRANSFERENCIA') NOT NULL, fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
 estado ENUM('PENDIENTE','PAGADO','ANULADO') DEFAULT 'PENDIENTE', referencia VARCHAR(100), observaciones TEXT,
 FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente), FOREIGN KEY (id_cita) REFERENCES citas(id_cita), FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);
CREATE TABLE reprogramaciones (
 id_reprogramacion INT AUTO_INCREMENT PRIMARY KEY, id_cita INT NOT NULL, fecha_anterior DATE NOT NULL, hora_anterior TIME NOT NULL, fecha_nueva DATE NOT NULL, hora_nueva TIME NOT NULL, motivo VARCHAR(255), fecha_reprogramacion DATETIME DEFAULT CURRENT_TIMESTAMP, id_usuario INT NULL,
 FOREIGN KEY (id_cita) REFERENCES citas(id_cita), FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
CREATE TABLE auditoria (
 id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY, id_usuario INT NULL, accion VARCHAR(100) NOT NULL, tabla_afectada VARCHAR(100), id_registro VARCHAR(50), descripcion TEXT, fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
);

INSERT INTO roles(nombre_rol,descripcion) VALUES
('ADMINISTRADOR','Control total del sistema'),('PACIENTE','Acceso del paciente'),('ODONTOLOGO','Gestión clínica'),('RECEPCION','Gestión de recepción'),('MARKETING','Gestión de marketing');
INSERT INTO servicios(nombre,descripcion,precio) VALUES
('Consulta odontológica','Consulta general',50.00),('Limpieza dental','Limpieza dental',80.00),('Endodoncia','Tratamiento de conductos',350.00),('Cirugía / Extracción dental','Extracción dental',120.00),('Blanqueamiento dental','Blanqueamiento',250.00),('Ortodoncia','Tratamiento de ortodoncia',300.00);

CREATE INDEX idx_usuarios_rol_estado ON usuarios(id_rol,estado);
CREATE INDEX idx_pacientes_nombres ON pacientes(apellidos,nombres);
CREATE INDEX idx_citas_fecha_estado ON citas(fecha,estado);
CREATE INDEX idx_horarios_fecha_estado ON horarios(fecha,estado);
CREATE INDEX idx_pagos_fecha_estado ON pagos(fecha_pago,estado);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);
