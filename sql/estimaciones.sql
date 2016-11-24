-- MySQL dump 10.13  Distrib 5.7.12, for osx10.11 (x86_64)
--
-- Host: localhost    Database: dym
-- ------------------------------------------------------
-- Server version	5.7.12

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `estimaciones`
--

DROP TABLE IF EXISTS `estimaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estimaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `obra` int(11) NOT NULL,
  `fecha` datetime DEFAULT NULL,
  `periodo_incio` date DEFAULT NULL,
  `periodo_final` date DEFAULT NULL,
  `residente` int(11) NOT NULL,
  `proveedor` int(11) DEFAULT NULL,
  `numero` int(11) NOT NULL,
  `concepto` varchar(45) DEFAULT NULL,
  `unidad` varchar(45) DEFAULT NULL,
  `cantidad_presupuesto` varchar(45) DEFAULT NULL,
  `esta_estimacion` int(11) DEFAULT NULL,
  `acumulado_anterior` int(11) DEFAULT NULL,
  `acumulado_actual` int(11) DEFAULT NULL,
  `por_ejercer` int(11) DEFAULT NULL,
  `precio_unitario` int(11) DEFAULT NULL,
  `importe` int(11) DEFAULT NULL,
  `subtotal` int(11) DEFAULT NULL,
  `iva` int(11) DEFAULT NULL,
  `retencion` int(11) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `pagado` varchar(45) DEFAULT NULL,
  `facturas` int(11) DEFAULT NULL,
  `firma_residente` varchar(45) DEFAULT NULL,
  `autorizacion` varchar(45) DEFAULT NULL,
  `firma_contratista` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idobra_idx` (`obra`),
  KEY `idresidente_idx` (`residente`),
  KEY `idproveedor_idx` (`proveedor`),
  CONSTRAINT `idobra` FOREIGN KEY (`obra`) REFERENCES `obras` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `idproveedor` FOREIGN KEY (`proveedor`) REFERENCES `proveedores` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `idresidente` FOREIGN KEY (`residente`) REFERENCES `residentes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estimaciones`
--

LOCK TABLES `estimaciones` WRITE;
/*!40000 ALTER TABLE `estimaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `estimaciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-10-26 12:37:30
