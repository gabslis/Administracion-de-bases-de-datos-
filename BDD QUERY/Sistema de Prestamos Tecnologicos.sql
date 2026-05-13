-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: sistemaprestamostecnologicos
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

-- SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '1445d8e8-438f-11f1-9478-dd50f7e69a4f:1-4158:1000071-1005114:2000086-2000172,
-- 1445e85d-438f-11f1-9478-dd50f7e69a4f:1-47,
-- 923034b2-2d6a-11f1-9bba-14141656a86b:1-4';

--
-- Table structure for table `accesorios`
--

DROP TABLE IF EXISTS `accesorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accesorios` (
  `cod_accesorio` int NOT NULL AUTO_INCREMENT,
  `cod_marca` int DEFAULT NULL,
  `nombre_accesorio` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cod_accesorio`),
  KEY `cod_marca` (`cod_marca`),
  CONSTRAINT `accesorios_ibfk_1` FOREIGN KEY (`cod_marca`) REFERENCES `marcas` (`cod_marca`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accesorios`
--

LOCK TABLES `accesorios` WRITE;
/*!40000 ALTER TABLE `accesorios` DISABLE KEYS */;
INSERT INTO `accesorios` VALUES (1,1,'Cargador Dell 65W Universal'),(2,1,'Mouse Dell MS116 USB'),(3,2,'Cargador HP Punta Azul 45W'),(4,4,'Adaptador Apple USB-C a VGA'),(5,4,'Apple Pencil 2da Generación'),(6,6,'Mouse Inalámbrico Logitech'),(7,7,'Control Remoto Proyector Epson'),(8,8,'Samsung S-Pen Pro'),(9,10,'Batería Sony NP-FZ100'),(10,11,'Microsoft Surface Pen');
/*!40000 ALTER TABLE `accesorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas`
--

DROP TABLE IF EXISTS `aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas` (
  `cod_aula` int NOT NULL AUTO_INCREMENT,
  `nombre_aula` varchar(50) DEFAULT NULL,
  `cod_edificio` int DEFAULT NULL,
  PRIMARY KEY (`cod_aula`),
  KEY `cod_edificio` (`cod_edificio`),
  CONSTRAINT `aulas_ibfk_1` FOREIGN KEY (`cod_edificio`) REFERENCES `edificios` (`cod_edificio`)
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas`
--

LOCK TABLES `aulas` WRITE;
/*!40000 ALTER TABLE `aulas` DISABLE KEYS */;
INSERT INTO `aulas` VALUES (101,'Aula Magna A',1),(102,'Laboratorio de Cómputo 1',2),(103,'Taller de Escultura',3),(104,'Salón de Francés',4),(105,'Sala de Juntas B',5),(106,'Lab. Química Orgánica',6),(107,'Hemeroteca',7),(108,'Aula Virtual 4',8),(109,'Salón de Usos Múltiples',9),(110,'Cabina de Audio',10);
/*!40000 ALTER TABLE `aulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edificios`
--

DROP TABLE IF EXISTS `edificios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edificios` (
  `cod_edificio` int NOT NULL AUTO_INCREMENT,
  `nombre_edificio` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cod_edificio`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edificios`
--

LOCK TABLES `edificios` WRITE;
/*!40000 ALTER TABLE `edificios` DISABLE KEYS */;
INSERT INTO `edificios` VALUES (1,'Edificio Central'),(2,'Pabellón de Ingeniería'),(3,'Facultad de Artes'),(4,'Torre de Idiomas'),(5,'Edificio Administrativo'),(6,'Laboratorios de Ciencias'),(7,'Biblioteca Magna'),(8,'Centro de Postgrados'),(9,'Edificio Norte'),(10,'Auditorio Principal');
/*!40000 ALTER TABLE `edificios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `cod_equipo` int NOT NULL AUTO_INCREMENT,
  `serial` varchar(50) DEFAULT NULL,
  `cod_marca` int DEFAULT NULL,
  `nombre_equipo` varchar(50) DEFAULT NULL,
  `cod_estado_equipo` int DEFAULT NULL,
  PRIMARY KEY (`cod_equipo`),
  UNIQUE KEY `serial` (`serial`),
  KEY `cod_marca` (`cod_marca`),
  KEY `cod_estado_equipo` (`cod_estado_equipo`),
  CONSTRAINT `equipos_ibfk_1` FOREIGN KEY (`cod_marca`) REFERENCES `marcas` (`cod_marca`),
  CONSTRAINT `equipos_ibfk_2` FOREIGN KEY (`cod_estado_equipo`) REFERENCES `estado_equipo` (`cod_estado_equipo`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (28,'SN-DL-001',1,'Laptop Dell Latitude',1),(29,'SN-HP-002',2,'Desktop HP Elite',1),(30,'SN-LV-003',3,'Laptop Lenovo ThinkPad',2),(31,'SN-AP-004',4,'MacBook Pro M2',1),(32,'SN-AS-005',5,'Laptop Asus Zenbook',1),(33,'SN-LG-006',6,'Mouse Logitech G502',1),(34,'SN-EP-007',7,'Impresora Epson L3210',1),(35,'SN-SM-008',8,'Monitor Samsung Odyssey',1),(36,'SN-VS-009',9,'Monitor ViewSonic 24\"',1),(37,'SN-SY-010',10,'Cámara Sony Alpha',1),(38,'SN-MS-011',11,'Teclado Microsoft Surface',1),(39,'SN-DL-012',1,'Monitor Dell UltraSharp',1),(40,'SN-HP-013',2,'Impresora HP LaserJet',1),(41,'SN-LV-014',3,'Tablet Lenovo Tab',1),(42,'SN-AP-015',4,'iPad Air',1),(43,'SN-AS-016',5,'Placa Base Asus ROG',1),(44,'SN-LG-017',6,'Teclado Logitech K120',1),(45,'SN-EP-018',7,'Proyector Epson PowerLite',1),(46,'SN-SM-019',8,'Tablet Samsung Galaxy Tab',1),(47,'SN-VS-020',9,'Monitor ViewSonic Curvo',1),(48,'SN-SY-021',10,'Audífonos Sony WH-1000XM5',1),(49,'SN-MS-022',11,'Mouse Microsoft Arc',1),(50,'SN-DL-023',1,'Servidor Dell PowerEdge',1),(51,'SN-HP-024',2,'Laptop HP ProBook',1);
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_equipo`
--

DROP TABLE IF EXISTS `estado_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_equipo` (
  `cod_estado_equipo` int NOT NULL AUTO_INCREMENT,
  `tipo_estado_equipo` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`cod_estado_equipo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_equipo`
--

LOCK TABLES `estado_equipo` WRITE;
/*!40000 ALTER TABLE `estado_equipo` DISABLE KEYS */;
INSERT INTO `estado_equipo` VALUES (1,'Activo'),(2,'Inactivo');
/*!40000 ALTER TABLE `estado_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_mantenimiento`
--

DROP TABLE IF EXISTS `estado_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_mantenimiento` (
  `cod_estado_mantenimiento` int NOT NULL AUTO_INCREMENT,
  `tipo_estado_mantenimiento` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cod_estado_mantenimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_mantenimiento`
--

LOCK TABLES `estado_mantenimiento` WRITE;
/*!40000 ALTER TABLE `estado_mantenimiento` DISABLE KEYS */;
INSERT INTO `estado_mantenimiento` VALUES (1,'Pendiente'),(2,'En Proceso'),(3,'Completado');
/*!40000 ALTER TABLE `estado_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_usuario`
--

DROP TABLE IF EXISTS `estado_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_usuario` (
  `cod_estado_usuario` int NOT NULL AUTO_INCREMENT,
  `tipo_estado_usuario` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`cod_estado_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_usuario`
--

LOCK TABLES `estado_usuario` WRITE;
/*!40000 ALTER TABLE `estado_usuario` DISABLE KEYS */;
INSERT INTO `estado_usuario` VALUES (1,'Activo'),(2,'Inactivo'),(3,'Suspendido');
/*!40000 ALTER TABLE `estado_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gravedad_incidencia`
--

DROP TABLE IF EXISTS `gravedad_incidencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gravedad_incidencia` (
  `cod_gravedad_incidencia` int NOT NULL AUTO_INCREMENT,
  `tipo_gravedad_incidencia` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cod_gravedad_incidencia`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gravedad_incidencia`
--

LOCK TABLES `gravedad_incidencia` WRITE;
/*!40000 ALTER TABLE `gravedad_incidencia` DISABLE KEYS */;
INSERT INTO `gravedad_incidencia` VALUES (1,'Baja'),(2,'Media'),(3,'Alta'),(4,'Crítica');
/*!40000 ALTER TABLE `gravedad_incidencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidencias`
--

DROP TABLE IF EXISTS `incidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidencias` (
  `cod_incidencia` int NOT NULL AUTO_INCREMENT,
  `cod_prestamo` int DEFAULT NULL,
  `descripcion` text,
  `fecha_incidencia` date DEFAULT NULL,
  `cod_gravedad_incidencia` int DEFAULT NULL,
  PRIMARY KEY (`cod_incidencia`),
  KEY `cod_gravedad_incidencia` (`cod_gravedad_incidencia`),
  KEY `cod_prestamo` (`cod_prestamo`),
  CONSTRAINT `incidencias_ibfk_1` FOREIGN KEY (`cod_gravedad_incidencia`) REFERENCES `gravedad_incidencia` (`cod_gravedad_incidencia`),
  CONSTRAINT `incidencias_ibfk_2` FOREIGN KEY (`cod_prestamo`) REFERENCES `prestamos` (`cod_prestamo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidencias`
--

LOCK TABLES `incidencias` WRITE;
/*!40000 ALTER TABLE `incidencias` DISABLE KEYS */;
INSERT INTO `incidencias` VALUES (2,3,'daño la ssd','2026-05-10',2),(3,3,'ssd mmuy muy dañada','2026-05-10',4);
/*!40000 ALTER TABLE `incidencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimientos`
--

DROP TABLE IF EXISTS `mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimientos` (
  `cod_mantenimiento` int NOT NULL AUTO_INCREMENT,
  `cod_equipo` int DEFAULT NULL,
  `cod_tipo_mantenimiento` int DEFAULT NULL,
  `cod_usuario` int DEFAULT NULL,
  `cod_estado_mantenimiento` int DEFAULT NULL,
  `fecha_inicio_mantenimiento` date DEFAULT NULL,
  `hora_recibida` time DEFAULT NULL,
  `fecha_fin_mantenimiento` date DEFAULT NULL,
  `Hora_retirada` time DEFAULT NULL,
  `descripcion_problema` text,
  PRIMARY KEY (`cod_mantenimiento`),
  KEY `cod_equipo` (`cod_equipo`),
  KEY `cod_usuario` (`cod_usuario`),
  KEY `cod_tipo_mantenimiento` (`cod_tipo_mantenimiento`),
  KEY `cod_estado_mantenimiento` (`cod_estado_mantenimiento`),
  CONSTRAINT `mantenimientos_ibfk_1` FOREIGN KEY (`cod_equipo`) REFERENCES `equipos` (`cod_equipo`),
  CONSTRAINT `mantenimientos_ibfk_2` FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (`cod_usuario`),
  CONSTRAINT `mantenimientos_ibfk_3` FOREIGN KEY (`cod_tipo_mantenimiento`) REFERENCES `tipo_mantenimiento` (`cod_tipo_mantenimiento`),
  CONSTRAINT `mantenimientos_ibfk_4` FOREIGN KEY (`cod_estado_mantenimiento`) REFERENCES `estado_mantenimiento` (`cod_estado_mantenimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimientos`
--

LOCK TABLES `mantenimientos` WRITE;
/*!40000 ALTER TABLE `mantenimientos` DISABLE KEYS */;
INSERT INTO `mantenimientos` VALUES (1,28,1,22,3,'2026-05-05',NULL,'2026-05-07','23:25:42',NULL),(2,28,2,22,3,'2026-05-05',NULL,'2026-05-09','14:48:01',NULL),(3,28,1,22,3,'2026-05-05','14:45:25','2026-05-08','14:47:58','Se me traba todo y no corre bien google chrome'),(4,39,2,21,3,'2026-05-08','23:02:58','2026-05-08','23:16:02','fbdvd'),(5,30,2,22,3,'2026-05-10','01:43:42','2026-05-13','01:47:42','no me funciona la pantalla'),(6,31,1,24,3,'2026-05-10','10:13:48','2026-05-13','10:14:35','esta un poco lenta, se traba al utilizar zafari'),(7,30,1,22,3,'2026-05-10','15:57:19','2026-05-20','15:59:22','mal uso de ssd'),(8,30,1,22,1,'2026-05-10','16:01:26',NULL,NULL,'pantalla rota'),(9,30,1,22,1,'2026-05-10','16:03:27',NULL,NULL,'mantinimiento'),(10,31,1,24,3,'2026-05-11','18:59:05','2026-05-11','19:00:24','esta muy lenta'),(11,30,2,22,3,'2026-05-12','19:08:31','2026-05-13','19:09:13','utcyg jvg');
/*!40000 ALTER TABLE `mantenimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas` (
  `cod_marca` int NOT NULL AUTO_INCREMENT,
  `nombre_marca` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`cod_marca`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (1,'Dell'),(2,'HP'),(3,'Lenovo'),(4,'Apple'),(5,'Asus'),(6,'Logitech'),(7,'Epson'),(8,'Samsung'),(9,'ViewSonic'),(10,'Sony'),(11,'Microsoft'),(12,'Acer'),(13,'Toshiba'),(14,'Huawei'),(15,'Canon'),(16,'Cisco'),(17,'TP-Link'),(18,'Xiaomi'),(19,'BenQ'),(20,'LG');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamos`
--

DROP TABLE IF EXISTS `prestamos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamos` (
  `cod_prestamo` int NOT NULL AUTO_INCREMENT,
  `cod_usuario` int DEFAULT NULL,
  `cod_aula` int DEFAULT NULL,
  `cod_equipo` int DEFAULT NULL,
  `cod_accesorio` int DEFAULT NULL,
  `fecha_salida` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion_programada` datetime DEFAULT NULL,
  PRIMARY KEY (`cod_prestamo`),
  KEY `cod_usuario` (`cod_usuario`),
  KEY `cod_aula` (`cod_aula`),
  KEY `cod_equipo` (`cod_equipo`),
  KEY `cod_accesorio` (`cod_accesorio`),
  CONSTRAINT `prestamos_ibfk_1` FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (`cod_usuario`),
  CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`cod_aula`) REFERENCES `aulas` (`cod_aula`),
  CONSTRAINT `prestamos_ibfk_3` FOREIGN KEY (`cod_equipo`) REFERENCES `equipos` (`cod_equipo`),
  CONSTRAINT `prestamos_ibfk_4` FOREIGN KEY (`cod_accesorio`) REFERENCES `accesorios` (`cod_accesorio`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamos`
--

LOCK TABLES `prestamos` WRITE;
/*!40000 ALTER TABLE `prestamos` DISABLE KEYS */;
INSERT INTO `prestamos` VALUES (2,5,108,29,3,'2026-05-05 00:00:00','2026-06-05 00:00:00'),(3,22,108,30,6,'2026-05-10 00:00:00','2026-05-11 00:00:00'),(4,24,108,31,5,'2026-05-10 00:00:00','2026-10-10 00:00:00'),(5,25,108,45,7,'2026-05-13 00:00:00','2026-05-14 00:00:00');
/*!40000 ALTER TABLE `prestamos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `cod_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`cod_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador'),(2,'Director'),(3,'Docente'),(4,'Técnico'),(5,'Coordinador');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sanciones`
--

DROP TABLE IF EXISTS `sanciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sanciones` (
  `cod_sancion` int NOT NULL AUTO_INCREMENT,
  `cod_usuario` int DEFAULT NULL,
  `cod_equipo` int DEFAULT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `fecha_sancion` date DEFAULT NULL,
  PRIMARY KEY (`cod_sancion`),
  KEY `cod_usuario` (`cod_usuario`),
  KEY `cod_equipo` (`cod_equipo`),
  CONSTRAINT `sanciones_ibfk_1` FOREIGN KEY (`cod_usuario`) REFERENCES `usuarios` (`cod_usuario`),
  CONSTRAINT `sanciones_ibfk_2` FOREIGN KEY (`cod_equipo`) REFERENCES `equipos` (`cod_equipo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sanciones`
--

LOCK TABLES `sanciones` WRITE;
/*!40000 ALTER TABLE `sanciones` DISABLE KEYS */;
INSERT INTO `sanciones` VALUES (2,22,30,'ssd dañada por usuario','2026-05-10');
/*!40000 ALTER TABLE `sanciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_mantenimiento`
--

DROP TABLE IF EXISTS `tipo_mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_mantenimiento` (
  `cod_tipo_mantenimiento` int NOT NULL AUTO_INCREMENT,
  `tipo_mantenimiento` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`cod_tipo_mantenimiento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_mantenimiento`
--

LOCK TABLES `tipo_mantenimiento` WRITE;
/*!40000 ALTER TABLE `tipo_mantenimiento` DISABLE KEYS */;
INSERT INTO `tipo_mantenimiento` VALUES (1,'Preventivo'),(2,'Correctivo');
/*!40000 ALTER TABLE `tipo_mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `cod_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `cod_rol` int DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `cod_estado_usuario` int DEFAULT NULL,
  PRIMARY KEY (`cod_usuario`),
  KEY `cod_rol` (`cod_rol`),
  KEY `cod_estado_usuario` (`cod_estado_usuario`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`cod_rol`) REFERENCES `roles` (`cod_rol`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`cod_estado_usuario`) REFERENCES `estado_usuario` (`cod_estado_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Ricardo Alberto Canales',1,'CR1122012025@unab.edu.sv','$2b$10$/NnjfDdDwcgO94LtHdDFp.Wju/TQdrZpshpxTfrBIgQ8LPnVRwfxa','2026-04-18',1),(2,'Sonia Margarita Portillo',3,'PS3344022025@unab.edu.sv','$2b$10$eTfLgS2/8ZjSww.4kTMWl.yJWh1eepCHvSCDfmGqS.e0B3KEv4C2S','2026-04-18',1),(3,'Marcos Aurelio Henríquez',4,'HM5566032025@unab.edu.sv',NULL,'2026-04-18',1),(4,'Elena Patricia Vaquero',3,'VE7788042025@unab.edu.sv',NULL,'2026-04-18',1),(5,'Jorge Alberto Villalobos',3,'VJ9900052025@unab.edu.sv',NULL,'2026-04-18',1),(6,'Claudia Rebeca Menjívar',2,'MC1122062025@unab.edu.sv',NULL,'2026-04-18',1),(7,'Fernando José Batres',3,'BF3344072025@unab.edu.sv',NULL,'2026-04-18',1),(8,'Gabriela María Zelaya',3,'ZG5566082025@unab.edu.sv',NULL,'2026-04-18',1),(9,'Roberto Carlos Alfaro',2,'AR7788092025@unab.edu.sv',NULL,'2026-04-18',1),(10,'Karla Ivette Orellana',3,'OK9900102025@unab.edu.sv',NULL,'2026-04-18',1),(11,'Luis Miguel Cisneros',4,'CL1122112025@unab.edu.sv',NULL,'2026-04-18',1),(12,'Andrea Michelle Solórzano',3,'SA3344122025@unab.edu.sv',NULL,'2026-04-18',1),(13,'Nelson Edgardo Campos',3,'CN5566132025@unab.edu.sv',NULL,'2026-04-18',1),(14,'Tatiana Elizabeth Jovel',2,'JT7788142025@unab.edu.sv',NULL,'2026-04-18',1),(16,'Vanessa Alexandra Rivas',3,'RV1122162025@unab.edu.sv',NULL,'2026-04-18',1),(17,'Daniel Ernesto Guzmán',3,'GD3344172025@unab.edu.sv',NULL,'2026-04-18',1),(18,'Monica Beatriz Pineda',3,'PM5566182025@unab.edu.sv',NULL,'2026-04-18',1),(19,'Hugo Alexander Flores',2,'FH7788192025@unab.edu.sv',NULL,'2026-04-18',1),(20,'Rebeca Noemí Castro',3,'CR9900202025@unab.edu.sv',NULL,'2026-04-18',1),(21,'Erick Rafael Ventura Chacón',4,'vc0421012025@unab.edu.sv','$2b$10$MvIKVyZKhK5H4RemmhSJfuKAVfOOYA3pcPQ/u.SNFKgAUhDqoSUGm','2026-05-05',1),(22,'Nelly Vanessa Ramírez García',3,'RG1118012025@unab.edu.sv','$2b$10$pi76vb3VEFo1.yF1TCCqIu5.KdaHzCS6tAAlDe3k31jO1T85YnR16','2026-05-05',1),(23,'MELISSA RAMIREZ',4,'VANERAMIREZ0909@gmail.com','$2b$10$EvNlLefF4ODO/DWxFJIRcOaWIUmh4JDuNfyvIs3rPmACxyzaY3VmS','2026-05-05',1),(24,'Erick Test',3,'erick.test@test.com','$2b$10$urPmI6o2/KQd5kGvmDLWael5fnaOBDzAyB1qsvModfzIHM8bkbfti','2026-05-10',1),(25,'Osiris ',3,'osiris.test@tes.com','$2b$10$VzsKmm.8f9fhIXifP0F3uuvCxlw9Rfi.75UiaTitKcLnWJ5R1bGle','2026-05-12',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-12 21:26:44
