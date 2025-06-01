-- new database dump
CREATE DATABASE IF NOT EXISTS `seatify`
/*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */
/*!80016 DEFAULT ENCRYPTION='N' */
;
USE `seatify`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: seatify
-- ------------------------------------------------------
-- Server version	8.0.40
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!50503 SET NAMES utf8 */
;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */
;
/*!40103 SET TIME_ZONE='+00:00' */
;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */
;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */
;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */
;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */
;
--
-- Table structure for table `cafes`
--
DROP TABLE IF EXISTS `cafes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `cafes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `cafe_name` varchar(255) NOT NULL,
  `location` text,
  `contact_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `location_id` int DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id` (`owner_id`),
  KEY `fk_location` (`location_id`),
  CONSTRAINT `fk_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE
  SET NULL,
    CONSTRAINT `id` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 8 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `cafes`
--
LOCK TABLES `cafes` WRITE;
/*!40000 ALTER TABLE `cafes` DISABLE KEYS */
;
INSERT INTO `cafes`
VALUES (
    3,
    26,
    'Hot Wok',
    'Yakkala',
    '041256356',
    '2025-04-10 07:41:08',
    '2025-05-20 19:05:14',
    2,
    NULL
  ),
(
    5,
    38,
    'Bee Cafe',
    'Dehiwala',
    '0715552223',
    '2025-04-14 23:45:16',
    '2025-05-20 19:05:45',
    1,
    NULL
  ),
(
    6,
    39,
    'Viz Cafe',
    'Yakkala',
    '0716552223',
    '2025-04-14 23:47:37',
    '2025-05-20 19:05:45',
    2,
    NULL
  ),
(
    7,
    50,
    'Vito King',
    NULL,
    '0456322633',
    '2025-05-21 07:01:05',
    '2025-05-21 07:01:05',
    2,
    NULL
  );
/*!40000 ALTER TABLE `cafes` ENABLE KEYS */
;
UNLOCK TABLES;
--
-- Table structure for table `locations`
--
DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `locations`
--
LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */
;
INSERT INTO `locations`
VALUES (1, 'Dehiwala'),
(2, 'Yakkala');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */
;
UNLOCK TABLES;
--
-- Table structure for table `users`
--
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
;
/*!50503 SET character_set_client = utf8mb4 */
;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 51 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */
;
--
-- Dumping data for table `users`
--
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */
;
INSERT INTO `users`
VALUES (
    13,
    'user2@example.com',
    'scrypt:32768:8:1$6mz5OyES5wCVSJJl$7cc5f91ef860167b488e69ef5c540691b6b7f5852f2007fd4baa70ecbed44c2a035c1b605a9a692783cb3f994bcc5618730118c44c89ff3953f441dbe0e22d50',
    2
  ),
(
    14,
    'user3@example.com',
    'scrypt:32768:8:1$tyWOKSOpTG3zbHG1$236ff640629b3673107c027b489606ca8271cf55ccb0074fb2941607667214bdeeb45fbd6ee5cff7dc3824eac5f25c58560734fc3eb24bea423d11de4c959bbc',
    2
  ),
(
    26,
    'user10@example.com',
    'scrypt:32768:8:1$rgcZbTk3FxMv8dag$5a8d783853f0410e8321d1e381ba45c448fd56b73136829861039c50c9bea967184e5c0433af562e120de5b7232f815fa0f779cd147faefffcb091dcbb033b84',
    2
  ),
(
    28,
    'admin@gmail.com',
    'scrypt:32768:8:1$XVEFU2BOqHxdBJ1g$95f9f8ebc81d1b6e2c5249f2e8554cc046665c3d45a2e8362b0e3b1858d4467a9d818780bcbc62cb113cd9e134b8238bc0415f61f9dea0bae9f41aef9b2a1734',
    3
  ),
(
    30,
    'user12@example.com',
    'scrypt:32768:8:1$NAr4HdhjPQFXUHA2$7401cecfa999e375ee8d8f5b576ea732445fdcc34a416a9cfff3b30598a102bea2b1837c71c750fcc9f97514cd50306082bb8378970356f1e634654092eec37f',
    2
  ),
(
    31,
    'user13@example.com',
    'scrypt:32768:8:1$wUmD0YGfwhVsfpVc$fc7ef61715345dab976534cf4e5f13ae81b77b3d4e7a5f3ee2a82e2afab553f85e961ef0906372a569a0ae25283306eb7029b2e16bde17f6ec8e5d65ef456cd9',
    2
  ),
(
    32,
    'user14@example.com',
    'scrypt:32768:8:1$ND20BUBCyFHIk983$8e9f684b5084cc8fbac6316a44108acdb61098c355c01cf7a144370a9b22c9c0d80f3b914d9416d18446bbbf94061442ca7d5f62a7f52287e53f3eb8e82ab960',
    2
  ),
(
    33,
    'user21@example.com',
    'scrypt:32768:8:1$OBxmNnC33GSUZCPS$02e8525cccf54903d73e40e80674f83cd7c8a3a1dd7fcd663aac2e874ec734b2860c691a1f5ef57d986ed5bf15818977bab7e5f8bc9a5cd60f4a60776876a621',
    2
  ),
(
    34,
    'user22@example.com',
    'scrypt:32768:8:1$gMViX7tjBVMbLYMz$6fc3bb6fe9c7233392527b49042f9dbb2627875e260100af5cd46b6d33ab2b02764eee10d6ab22f6bd3391c4a013cb6d8e6082fcb65c6ff71987c29bce5ebbe9',
    2
  ),
(
    35,
    'user25@example.com',
    'scrypt:32768:8:1$GSoqhmMs4jHEKHsl$1cf25e6d8a6f7249f3cc3e130150b1c1b113521697c95c6fa8f635b2e7c5ebf3e72799d61d070a5bd070815724365e02dfdb05ea305b467affd921bc18f84c58',
    2
  ),
(
    38,
    'abc@gmail.com',
    'scrypt:32768:8:1$AHSPjCOHpcYuGXzl$894d975fd040e3b7169198d033c3ca0e3865ffa94572c56737f029f81d4fd35a0a725a3a188c90e2be20314d9cf7b3701ff15cbf3644e3d21a89650d1376b918',
    2
  ),
(
    39,
    'vst@gmail.com',
    'scrypt:32768:8:1$W9zVhnShzohPs8GS$0dff4ccb47bfceafc1560a841d7d09f3bb0b0cbf0f76fe96af95ea8660d9728c47f683a26a1f89f57ebc884716e192dfe6e3e2b164a0ad3a376f39c0be97d5b5',
    2
  ),
(
    41,
    'cafe1@gmail.com',
    'scrypt:32768:8:1$Iw57IgBuvzmdLwYy$36cdff9c95c29c2afab0404c57194697816ac0bf52146bf03b55894b65d2b7864f96da2bc85648c49c2ee68f5852329f894053b178323293c86a72e5394930e2',
    2
  ),
(
    45,
    'customer1@gmail.com',
    'scrypt:32768:8:1$75o6u1kklY8o7Loz$06cab05ffeda8451dc203a77dfbcba6f19ab41cb6f399255b5e401f34b688f37862b12e3a2983a97893ad673805a3bb47e6d2ee02e3aaf08cbf7ac6a3ffd1b9d',
    1
  ),
(
    50,
    'Vito@gmail.com',
    'scrypt:32768:8:1$VzUIOQ5QMyzSKKIx$20365238f8164befa6e1cd454661742db2d9b3a03ec65b2da35b3d6f9b93e496b5cba6a763723c2837d335b28d1ef48f9682e1b0b5453e3f12cbe14f98791809',
    2
  );
/*!40000 ALTER TABLE `users` ENABLE KEYS */
;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */
;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */
;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */
;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */
;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */
;
-- Dump completed on 2025-05-22  2:26:22