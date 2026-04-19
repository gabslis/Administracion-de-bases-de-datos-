CREATE DATABASE IF NOT EXISTS SistemaPrestamosTecnologicos;
USE SistemaPrestamosTecnologicos;

-- 1. Marcas
CREATE TABLE Marcas (cod_marca INT PRIMARY KEY AUTO_INCREMENT, nombre_marca VARCHAR(50));

-- 2. Estado_Mantenimiento
CREATE TABLE Estado_Mantenimiento (cod_estado_mantenimiento INT PRIMARY KEY AUTO_INCREMENT, tipo_estado_mantenimiento VARCHAR(50));

-- 3. Estado_Equipo
CREATE TABLE Estado_Equipo (cod_estado_equipo INT PRIMARY KEY AUTO_INCREMENT, tipo_estado_equipo VARCHAR(30));

-- 4. Edificios
CREATE TABLE Edificios (cod_edificio INT PRIMARY KEY AUTO_INCREMENT, nombre_edificio VARCHAR(50));

-- 5. Aulas
CREATE TABLE Aulas (
    cod_aula INT PRIMARY KEY AUTO_INCREMENT, 
    nombre_aula VARCHAR(50), 
    cod_edificio INT,
    FOREIGN KEY (cod_edificio) REFERENCES Edificios(cod_edificio)
);

-- 6. Equipos
CREATE TABLE Equipos (
    cod_equipo INT PRIMARY KEY AUTO_INCREMENT,
    serial VARCHAR(50) UNIQUE,
    cod_marca INT,
    nombre_equipo VARCHAR(50),
    cod_estado_equipo INT,
    FOREIGN KEY (cod_marca) REFERENCES Marcas(cod_marca),
    FOREIGN KEY (cod_estado_equipo) REFERENCES Estado_Equipo(cod_estado_equipo)
);

-- 7. Accesorios (Para teclados, mouses, etc.)
CREATE TABLE Accesorios (
    cod_accesorio INT PRIMARY KEY AUTO_INCREMENT,
    nombre_accesorio VARCHAR(50)
);

-- 8. Roles
CREATE TABLE Roles (cod_rol INT PRIMARY KEY AUTO_INCREMENT, nombre_rol VARCHAR(30));

-- 9. Estado Usuario
CREATE TABLE Estado_Usuario (cod_estado_usuario INT PRIMARY KEY AUTO_INCREMENT, tipo_estado_usuario VARCHAR(100));

-- 10. Usuarios
CREATE TABLE Usuarios (
    cod_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    cod_rol INT,
    correo VARCHAR(100),
    fecha_ingreso DATE,
    cod_estado_usuario INT,
    FOREIGN KEY (cod_rol) REFERENCES Roles(cod_rol),
    FOREIGN KEY (cod_estado_usuario) REFERENCES Estado_Usuario(cod_estado_usuario)
);

-- 11. Prestamos
CREATE TABLE Prestamos (
    cod_prestamo INT PRIMARY KEY AUTO_INCREMENT,
    cod_usuario INT,
    cod_aula INT,
    cod_equipo INT,
    cod_accesorio INT,
    fecha_salida DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_programada DATETIME,
    FOREIGN KEY (cod_usuario) REFERENCES Usuarios(cod_usuario),
    FOREIGN KEY (cod_aula) REFERENCES Aulas(cod_aula),
    FOREIGN KEY (cod_equipo) REFERENCES Equipos(cod_equipo),
    FOREIGN KEY (cod_accesorio) REFERENCES Accesorios(cod_accesorio)
);

-- 12. Gravedad Incidencia
CREATE TABLE Gravedad_Incidencia(
    cod_gravedad_incidencia INT PRIMARY KEY AUTO_INCREMENT,
tipo_gravedad_incidencia VARCHAR(50)
    );

-- 13. Incidencias (Reportes de daños específicos)
CREATE TABLE Incidencias (
    cod_incidencia INT PRIMARY KEY AUTO_INCREMENT,
    cod_prestamo INT,
    descripcion TEXT,
    fecha_incidencia DATE,
    cod_gravedad_incidencia INT,
FOREIGN KEY (cod_gravedad_incidencia) REFERENCES Gravedad_Incidencia(cod_gravedad_incidencia),
    FOREIGN KEY (cod_prestamo) REFERENCES Prestamos(cod_prestamo)
);

-- 14. Sanciones
CREATE TABLE Sanciones (
    cod_sancion INT PRIMARY KEY AUTO_INCREMENT,
    cod_usuario INT,
   cod_equipo INT,
    motivo VARCHAR(255),
    fecha_sancion DATE,
    FOREIGN KEY (cod_usuario) REFERENCES Usuarios(cod_usuario),
FOREIGN KEY (cod_equipo) REFERENCES Equipos(cod_equipo)
);

-- 15. Tipo de Mantenimiento
CREATE TABLE Tipo_Mantenimiento (
    cod_tipo_mantenimiento INT PRIMARY KEY AUTO_INCREMENT,
    tipo_mantenimiento VARCHAR(25)
);
-- 16. Mantenimientos
CREATE TABLE Mantenimientos (
    cod_mantenimiento INT PRIMARY KEY AUTO_INCREMENT,
    cod_equipo INT,
    cod_tipo_mantenimiento INT,
    cod_usuario INT,
    cod_estado_mantenimiento INT,
    fecha_inicio_mantenimiento DATE,
    hora_recibida TIME,
    fecha_fin_mantenimiento DATE,
    Hora_retirada TIME,
    FOREIGN KEY (cod_equipo) REFERENCES Equipos(cod_equipo),
    FOREIGN KEY (cod_usuario) REFERENCES Usuarios(cod_usuario),
    FOREIGN KEY (cod_tipo_mantenimiento) REFERENCES Tipo_Mantenimiento(cod_tipo_mantenimiento),
    FOREIGN KEY (cod_estado_mantenimiento) REFERENCES Estado_Mantenimiento(cod_estado_mantenimiento)
);

