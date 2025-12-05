-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-12-2025 a las 22:00:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `figumarket`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conversacion_archivada`
--

CREATE TABLE `conversacion_archivada` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `otro_usuario_id` int(11) NOT NULL,
  `figura_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `doctrine_migration_versions`
--

CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `doctrine_migration_versions`
--

INSERT INTO `doctrine_migration_versions` (`version`, `executed_at`, `execution_time`) VALUES
('DoctrineMigrations\\Version20251111153000', '2025-11-11 15:49:39', 331),
('DoctrineMigrations\\Version20251113120000', '2025-11-13 05:06:01', 217),
('DoctrineMigrations\\Version20251114195500', '2025-11-14 20:02:23', 230),
('DoctrineMigrations\\Version20251114220000', '2025-11-21 12:32:02', 83),
('DoctrineMigrations\\Version20251121123000', '2025-11-21 12:32:02', 6),
('DoctrineMigrations\\Version20251123123000', '2025-11-23 16:26:28', 233),
('DoctrineMigrations\\Version20251125143000', '2025-11-25 16:49:56', 36),
('DoctrineMigrations\\Version20251125Seguimientos', '2025-11-25 14:22:44', 587);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `figura`
--

CREATE TABLE `figura` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` longtext NOT NULL,
  `categoria` varchar(100) NOT NULL,
  `escala` varchar(50) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `disponible` tinyint(1) NOT NULL,
  `fecha_publicacion` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `destacado` tinyint(1) NOT NULL,
  `estado_figura` varchar(40) NOT NULL DEFAULT 'en buen estado',
  `destacado_inicio` datetime DEFAULT NULL,
  `destacado_fin` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `figura`
--

INSERT INTO `figura` (`id`, `usuario_id`, `nombre`, `descripcion`, `categoria`, `escala`, `estado`, `precio`, `disponible`, `fecha_publicacion`, `destacado`, `estado_figura`, `destacado_inicio`, `destacado_fin`) VALUES
(816, 19, 'Figura Acción 1/6 Aragorn El Señor de los Anillos', 'Nueva sellada nunca usada\nEdición limitada\nPrecio coste', 'peliculas', '1:6', 'disponible', 450.00, 1, '2025-11-21 11:40:41', 0, 'como nueva', NULL, NULL),
(817, 19, 'Predator Jungle hunter Hot toys', 'Figura coleccionable de Hot Toys del Predator Clásico de la película Predators.\n\n- Escala 1/6.\n- Incluye cabeza intercambiable.\n- Base temática con accesorios.\n-Edicion espevial, incluye un craneo limitado', 'peliculas', '1:6', 'disponible', 220.00, 1, '2025-11-21 11:53:27', 0, 'como nueva', NULL, NULL),
(818, 19, 'Figura 1/6 El club de lucha de Tyler Durden (Brad Pitt)', 'Figura 1/6 Tyler Durden (Brad Pitt) de la película Fight Club en excelentes condiciones, con todos los accesorios y la caja (añadí otro cigarrillo accesorio).\n\nEnvío rápido y bien protegido ✅', 'peliculas', '1:6', 'disponible', 150.00, 1, '2025-11-21 12:02:45', 1, 'en buen estado', '2025-11-25 15:58:44', '2025-12-10 15:58:44'),
(819, 19, 'Figura Marty McFly Regreso al Futuro II', 'Figura de acción de Marty McFly de Regreso al Futuro.\nEsta figura está en excelentes condiciones\nES UNA EDICION ESPECIAL\nSolo unos pocos fueron seleccionados con una figura extra, en este caso el revolver con las manos extras para poderlo coger.', 'otros', '1:12', 'disponible', 550.00, 1, '2025-11-21 12:07:47', 0, 'en buen estado', NULL, NULL),
(820, 19, 'Figura 1/6 Terminator T-1000 Present Toys', 'Con caja. INCLUYE la cabeza y el cuerpo adicionales que daban con la pre-reserva. OJO: Falta un efecto pequeño de impacto (extraviado). Perfecto estado. NO negociable. Más en mi perfil...!\n', 'peliculas', '1:6', 'disponible', 220.00, 1, '2025-11-21 12:12:51', 0, 'en buen estado', NULL, NULL),
(821, 19, 'Hot Toys 1/6 MMS684 Jake Sully DX Avatar TWOW', 'Figura de Jake Sully en Avatar El sentido del agua. Nueva, sellada. Versión deluxe.', 'peliculas', '1:6', 'disponible', 560.00, 1, '2025-11-21 12:16:35', 1, 'sin abrir', '2025-11-25 15:59:01', '2025-12-10 15:59:01'),
(822, 19, 'Hot Toys Terminator Génesis Endosqueleton MMS352', 'Precio final con envío gratis. Figura a escala 1/6 del T800 Endosqueleton (MMS352) en PERFECTO e impoluto estado con todo el contenido en su caja original. Expuesto únicamente para su inspeccion y posado y de vuelta a la caja, envío fotos e información por whatshapp a petición.', 'peliculas', '1:6', 'disponible', 475.00, 1, '2025-11-21 12:20:38', 1, 'en buen estado', '2025-11-25 16:00:32', '2025-12-10 16:00:32'),
(823, 19, 'Figura John Wick custom escala 1/6', 'Figura detallada custom de Keany Revés en la película de John Wick.Es una figura de colección en escala 1/6. Luce en excelentes condiciones. Se vende tal y como se ve en las fotos. Incluye: Cabeza realista, manos, cuerpo, pistola, pistola, pantalones, camisa, chaleco, corbata, chaqueta, perro y correa.\n\nMuy difícil de conseguir.', 'peliculas', '1:6', 'disponible', 150.00, 1, '2025-11-21 12:29:54', 0, 'en buen estado', NULL, NULL),
(824, 19, 'Assassin\'s Creed, Altair Figura Dam Toys', 'Assassin\'s Creed, figura Altair de la marca Dam Toys. Está en perfecto estado.\nSe abrió para hacerle las fotos.\nOriginal 100%\n\n- Figura de colección.\n- Altair Ibn-La\'Ahad.\n- De la marca Dam Toys.', 'videojuegos', '1:6', 'disponible', 425.00, 1, '2025-11-21 12:34:03', 0, 'en buen estado', NULL, NULL),
(825, 19, 'Figura Ellie CCtoys The Last of Us. No hot toys.', 'Figura de Ellie de CCtoys en perfecto estado. Es una figura genial para cualquier fanático de The Last of Us.\n\n- Figura de colección.\n- De la marca CCtoys.\n- En excelentes condiciones.\n\nCompleta en su caja original.', 'videojuegos', '1:6', 'disponible', 180.00, 1, '2025-11-21 12:36:28', 1, 'en buen estado', '2025-11-25 16:02:43', '2025-12-10 16:02:43'),
(826, 18, 'Mafex Superman (Batman Hush) Figura Acción', 'Figura de acción No. 117 de la marca Mafex de Superman, versión Batman: Hush. Abierta para hacer un par se fotos y devuelta a la caja. Nunca expuesta', 'dc', '1:12', 'disponible', 85.00, 1, '2025-11-21 12:41:27', 0, 'sin abrir', NULL, NULL),
(827, 18, 'Figura de acción Mafex n126 Batman Hush Black Ver.', 'Figura de acción de Batman Batman: Hush Black Ver. de Mafex. Personaje de Batman. Versión Black Ver. De la serie Batman: Hush. Marca Mafex. DC Comics. Producto original y nuevo abierto solo para fotografiar el contenido.', 'dc', '1:12', 'disponible', 98.00, 1, '2025-11-21 12:42:53', 1, 'como nueva', '2025-11-25 16:07:35', '2025-12-10 16:07:35'),
(828, 18, 'Figura Dc Multiverse Steppenwolf', 'Se vende figura de Steppenwolf de la línea Dc Multiverse de Mcfarlane, villano de la liga de la justicia/ justice league. Es una figura de colección en excelentes condiciones viene sin el plástico que lo sujeta.\nLibre de humos y se hacen envios.\n\n- Incluye figura y hacha y accesorios.\n- Figura articulada.\n- Diseño detallado y muy bien conservada.', 'dc', '1:12', 'disponible', 45.00, 1, '2025-11-21 12:45:50', 0, 'en buen estado', NULL, NULL),
(829, 18, 'Aquaman MAFEX', 'Figura de Aquaman de Mafex\n\nEn perfecto estado.\nSiempre en su blíster.\nNo expuesta ni jugada.\nPerfecto estado.\nSolo abierto para comprobación.\n\nDC, Justice League', 'dc', '1:12', 'disponible', 65.00, 1, '2025-11-21 12:47:09', 0, 'como nueva', NULL, NULL),
(830, 18, 'Medicom Mafex No.024 Wonder Woman Batman', 'Figura nueva en blister', 'dc', '1:12', 'disponible', 75.00, 1, '2025-11-21 12:53:30', 0, 'en buen estado', NULL, NULL),
(831, 18, 'The Boys Mafex Billy Butcher Figura - Nueva', 'Figura de acción de William Billy Butcher de la serie The Boys, de la línea MAFEX.\n\n- Incluye accesorios.\n- Modelo No. 154.\n\nFigura de colección, nueva.', 'otros', '1:12', 'disponible', 55.00, 1, '2025-11-21 12:58:53', 0, 'en buen estado', NULL, NULL),
(832, 18, 'MAFEX 175 Nightwing (Batman: Hush)', 'Figura de acción de Nightwing, versión de Batman: Hush.\n\n- Nueva\n- Figura de Nightwing.\n- Incluye cabezales intercambiables.\n- Accesorios adicionales.\n- Completamente original', 'dc', '1:12', 'disponible', 80.00, 1, '2025-11-21 13:00:09', 0, 'sin abrir', NULL, NULL),
(833, 18, 'Mafex 105 Batman Hush Figura Acción', 'Figura Mafex original nueva y precintada. Caja en perfecto estado. Se envía bien protegida.', 'dc', '1:12', 'disponible', 105.00, 1, '2025-11-21 13:02:12', 0, 'como nueva', NULL, NULL),
(834, 18, 'Mafex Magneto Original Comic', 'Figura original, importada de Japón. La Medicom Toy n° 179.\n\nNueva, sellada, y nunca abierta', 'comics', '1:12', 'disponible', 120.00, 1, '2025-11-21 13:05:55', 0, 'sin abrir', NULL, NULL),
(835, 18, 'Mafex 270 Knight Crusader Batman Figura Acción', 'Figura de acción Knight Crusader Batman de la línea MAFEX.\n\n- Diseño Black Ver..\n- Incluye accesorios intercambiables.\n- Licencia DC Comics.', 'dc', '1:12', 'disponible', 115.00, 1, '2025-11-21 13:09:47', 0, 'como nueva', NULL, NULL),
(836, 21, 'Sideshow Echo ARC Clon Trooper Star Wars exclusive', 'Figura coleccionable de Sideshow del soldado ARC Clone Trooper Echo de Star Wars en su versión exclusiva con la base de soporte con logo insginia de Echo.\nEn excelentes condiciones y con su caja y todos los accesorios . Siempre expuesta en vitrina . La tercera foto esta realizada fuera de la vitrina para la foto del anuncio.\nRealizo envíos.', 'star wars', '1:6', 'disponible', 545.00, 1, '2025-11-21 13:27:16', 0, 'en buen estado', NULL, NULL),
(837, 21, 'Padme MMS678 Hot toys El ataque de los clones', 'Nueva, sin abrir\nPadme Amidala. Star wars II. El ataque de los clones.\n\n\n■ Nota:\n- NO REGATEO PRECIO.\n- NO INCLUYE GASTOS DE ENVIO.\n- NO BUSCO INTERCAMBIOS.', 'star wars', '1:6', 'en negociación', 345.00, 1, '2025-11-21 13:39:21', 1, 'en buen estado', '2025-11-25 15:59:48', '2025-12-10 15:59:48'),
(838, 21, 'Hot Toys Mace Windu', 'Hot Toys de Mace Windu de \"El Ataque de los Clones\"\nExpuesta sólo tres meses, en perfecto estado, completa y con su caja original.\n\nVendo más de 90 Hot Toys de mi colección de Star Wars, si buscas alguna pregúntame', 'star wars', '1:6', 'disponible', 412.00, 0, '2025-11-21 13:40:28', 0, 'en buen estado', NULL, NULL),
(839, 21, 'Clone trooper Star Wars Sideshow', 'Soldado Clon de la 212 de la marca Sideshow, no es Hot toys. Figura creo del año 2009.\nSignos de uso y del paso del tiempo como por ejemplo articulaciones un poco flojas y la cuerina si la fuerzas se nota algo cuarteada, igual que les ocurre a el resto de figuras como esta. Ha estado siempre en vitrina.\nTiene todos sus accesorios.\n\nSi necesitas alguna foto más o tienes alguna duda yo te la resuelvo.\n\nPago mediante Bizum y envío por wallpop o correos certificado a cargo del comprador. No se rebaja más.\n\nPosible entrega en mano en Zaragoza.', 'star wars', '1:6', 'disponible', 375.00, 1, '2025-11-21 13:42:50', 0, 'en buen estado', NULL, NULL),
(840, 21, 'Boba Fett de Sideshow El Retorno del jedi', 'Oferta Figura de Boba Fett de la película El Retorno del Jedi.\nArticulaciones en perfecto estado, sin caja, lo que se ve y un par de manos más.\n- Es de Shideshow,no Hot Toys. Ultimo precio\n- Réplica detallada del personaje de Star Wars.', 'star wars', '1:6', 'disponible', 185.00, 1, '2025-11-21 13:44:37', 1, 'en buen estado', '2025-11-25 16:00:01', '2025-12-10 16:00:01'),
(841, 21, 'GENERAL GRIEVOUS FIGURA SIDESHOW', 'Escala 1:6 de el General Grievous con un tamaño de 41 centímetros. No intercambios. Preferible entrega en Madrid.', 'star wars', '1:6', 'disponible', 185.00, 1, '2025-11-21 13:52:40', 1, 'en buen estado', '2025-11-25 15:59:32', '2025-12-10 15:59:32'),
(842, 21, 'Battle Droid Geonosis Figura Star Wars Hot Toys', 'ULTIMA Escala 1/6 30cm Envio Incluido sin abrir', 'star wars', '1:6', 'disponible', 264.00, 1, '2025-11-21 14:05:40', 0, 'como nueva', NULL, NULL),
(843, 21, 'Hot Toys Darth Maul DX 16 Star Wars', 'Hot Toys Darth Maul Deluxe Star Wars DX16 la figura esta en muy buen estado, incluye su caja, todos los accesorios y su caja marrón\n\nDX16\nDX 16', 'star wars', '1:6', 'disponible', 356.00, 1, '2025-11-21 14:38:54', 0, 'en buen estado', NULL, NULL),
(844, 21, 'Sideshow The Child Star Wars NO Hot toys', 'Figura coleccionable de Sideshow NO Hot Toys The Child de Star Wars, también conocido como Baby Yoda.\nGrogu. The mandalorian\n\n- Modificado, articulados brazos y cabeza.\n- Detallado diseño inspirado en la serie The Mandalorian.\n- Incluye un accesorio esférico.\n- Base temática de The Mandalorian.\n- Dispongo de la caja marrón y de arte, todo en PERFECTO estado.\n\nNO hot toys inart sideshow', 'otros', '1:6', 'disponible', 220.00, 1, '2025-11-21 14:42:43', 0, 'en buen estado', NULL, NULL),
(845, 21, 'Hot Toys Darth Vader Figura Star Wars', 'Slide 3 of 6. Hot Toys Darth Vader Figura Star Wars carousel\nHot Toys Darth Vader Figura Star Wars carousel\n\n\n\n\n23\nDetalles del producto\nFigura de colección Darth Vader de Hot Toys (modelo MMS279, Una Nueva Esperanza) en escala 1/6, con todos sus accesorios originales, manos intercambiables, sable láser y soporte expositor.\n\nIncluye caja original en muy buen estado.\n\nEstado general:\nFigura bien cuidada y guardada siempre en su caja, apenas expuesta.\nImportante: la cuerina de brazos, guantes y piernas está desgastada por el paso del tiempo, es como si se pelara (algo común en estas figuras). Todo lo demás está perfecto y funcional. VER FOTOS\n\nPor este motivo, el precio es negociable', 'star wars', '1:6', 'disponible', 400.00, 1, '2025-11-21 14:48:06', 1, 'en buen estado', '2025-11-25 16:08:14', '2025-12-10 16:08:14'),
(846, 20, '1/6 Duende verde Toys era THE FIEND De luxe Ver.', 'Figurón escala 1/6 de Toys era Duende verde Green Goblin, The Fiend Deluxe Ver. FIGURA Y TAMBIÉN INCLUYE HOVERBOARD! Nueva en perfecto estado.', 'marvel', '1:6', 'disponible', 200.00, 1, '2025-11-21 14:56:50', 1, 'en buen estado', '2025-11-25 15:58:07', '2025-12-10 15:58:07'),
(847, 20, 'Hot Toys Spiderman Friendly Neighborhood Standard', '¡Hola! Vendo mi Spiderman de la película No Way Home, versión estándar con caja original. Todo en perfecto estado, headsculpt nunca expuesto. Manejado solo con guantes.', 'marvel', '1:6', 'disponible', 290.00, 1, '2025-11-21 14:59:09', 0, 'en buen estado', NULL, NULL),
(848, 20, 'Iron Man Mark IV Figura 1/4 HOT TOYS', 'Figura a la venta por ser demasiado grande. Precio negociable por privado. \n-Siempre muy buen cuidada\n-Manipulada con guantes', 'marvel', '1:4', 'disponible', 600.00, 1, '2025-11-21 15:56:56', 0, 'como nueva', NULL, NULL),
(849, 20, 'Thor figura 1/10 sideshow', 'figura tamaño 1/10 de thor versión clasica de los comics, de la marca sideshow. versión exclusiva comprada en la tienda sideshow que trae la rana pequeña. En perfecto estado. con caja de arte y marrón.', 'comics', '1:10', 'disponible', 120.00, 1, '2025-11-21 16:02:56', 0, 'en buen estado', NULL, NULL),
(850, 20, 'Hot Toys VGM34 Marvel Scarlet Spider 1/6', 'NUEVA Y PRECINTADA.\nCON CAJA MARRÓN Y DE ARTE.\nENVIO INMEDIATO.\n\nFigura de hot toys vgm34 del Scarlet Spider o Araña Escarlata del videojuego Marvel Spider-Man. Escala 1/6, 12 pulgadas, unos 30 centímetros.\n\n- Edición exclusiva de la Toy Fair 2019.', 'marvel', '1:6', 'disponible', 320.00, 1, '2025-11-21 17:02:57', 0, 'en buen estado', NULL, NULL),
(851, 20, 'Capitán América de Hot Toys (Endgame)', 'Juguete popular de Captain America Endgame 2019. Viaje en el tiempo versión 2012. Completo con todos sus accesorios', 'marvel', '1:6', 'disponible', 260.00, 1, '2025-11-21 17:05:56', 1, 'en buen estado', '2025-11-25 15:57:55', '2025-12-10 15:57:55'),
(852, 21, 'Figura Monkey D. Luffy Hot Toys 1/6 One Piece', 'Figura coleccionable de Monkey D. Luffy de One Piece, fabricada por Hot Toys. Nueva a estrenar Envio incluido a peninsula\n\n- Escala 1/6.\n- Diseño inspirado en la serie.\n- Incluye base expositora temática.', 'otros', '1:6', 'disponible', 450.00, 1, '2025-11-23 18:23:01', 0, 'en buen estado', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagen`
--

CREATE TABLE `imagen` (
  `id` int(11) NOT NULL,
  `figura_id` int(11) NOT NULL,
  `url` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `imagen`
--

INSERT INTO `imagen` (`id`, `figura_id`, `url`) VALUES
(1550, 816, '/uploads/fig_69204fb9e469c5.29725788.webp'),
(1551, 816, '/uploads/fig_69204fb9e4ba77.16309044.webp'),
(1552, 817, '/uploads/fig_692052b8517285.99714874.webp'),
(1553, 817, '/uploads/fig_692052b851ccc3.44809447.webp'),
(1554, 818, '/uploads/fig_692054f1f1e7e0.44096680.webp'),
(1555, 818, '/uploads/fig_692054f1f24b61.52455809.webp'),
(1556, 819, '/uploads/fig_69205613a05824.30148192.webp'),
(1557, 820, '/uploads/fig_69205743e04fa7.97262192.webp'),
(1558, 820, '/uploads/fig_69205743e0bf51.12830450.webp'),
(1560, 821, '/uploads/fig_69205823bbd1d8.55955506.webp'),
(1561, 821, '/uploads/fig_69205830253fd6.37660361.webp'),
(1562, 822, '/uploads/fig_69205916810b54.98567184.webp'),
(1563, 822, '/uploads/fig_69205916815576.61707207.webp'),
(1564, 823, '/uploads/fig_69205b4345ca54.18739684.webp'),
(1565, 824, '/uploads/fig_69205c3c0d8fe5.67849845.webp'),
(1566, 824, '/uploads/fig_69205c3c0dcee2.22458703.webp'),
(1567, 825, '/uploads/fig_69205ccca91a98.62721721.webp'),
(1568, 825, '/uploads/fig_69205ccca97722.09462035.webp'),
(1569, 826, '/uploads/fig_69205df84021e1.25262933.webp'),
(1570, 826, '/uploads/fig_69205df8406869.94928081.webp'),
(1572, 827, '/uploads/fig_69205e4dedfe45.20755298.webp'),
(1573, 827, '/uploads/fig_69205e5e1ef1f2.47620487.webp'),
(1574, 828, '/uploads/fig_69205eff03d8a5.08733499.webp'),
(1575, 828, '/uploads/fig_69205eff042a02.53899232.webp'),
(1576, 829, '/uploads/fig_69205f4d9c9be5.39592807.webp'),
(1577, 829, '/uploads/fig_69205f4d9cefb8.73502399.webp'),
(1578, 830, '/uploads/fig_692060cb422434.85584477.webp'),
(1579, 831, '/uploads/fig_6920620dc9b5d2.73927366.webp'),
(1580, 831, '/uploads/fig_6920620dc9fdb7.16295573.webp'),
(1581, 832, '/uploads/fig_69206259d4e606.05704780.webp'),
(1582, 832, '/uploads/fig_69206259d53942.00328806.webp'),
(1583, 833, '/uploads/fig_692062d4933bb8.94569958.webp'),
(1584, 833, '/uploads/fig_692062d493ff58.39902304.webp'),
(1585, 834, '/uploads/fig_692063b3d5b641.17401318.webp'),
(1586, 834, '/uploads/fig_692063b3d60505.29542646.webp'),
(1587, 835, '/uploads/fig_6920649c574dd4.20084027.webp'),
(1588, 836, '/uploads/fig_692068b5351e09.23678528.webp'),
(1589, 836, '/uploads/fig_692068b5356e07.16741533.webp'),
(1590, 837, '/uploads/fig_69206b8a559464.43217024.webp'),
(1591, 837, '/uploads/fig_69206b8a55dda4.73728135.webp'),
(1592, 838, '/uploads/fig_69206bcc80ff75.80058130.webp'),
(1593, 838, '/uploads/fig_69206bcc8151c6.93630889.webp'),
(1594, 839, '/uploads/fig_69206c5adf87d5.55407182.webp'),
(1595, 839, '/uploads/fig_69206c5b458935.95236185.webp'),
(1597, 840, '/uploads/fig_69206cc581ddc5.55320790.webp'),
(1598, 840, '/uploads/fig_69206cd4282519.66002859.webp'),
(1600, 841, '/uploads/fig_69206ea9173cc8.79324418.webp'),
(1601, 841, '/uploads/fig_69206fcd995434.00814704.webp'),
(1602, 842, '/uploads/fig_692071b45ca4e2.19961593.webp'),
(1603, 842, '/uploads/fig_692071b45ceb85.21448984.webp'),
(1604, 843, '/uploads/fig_6920797f1e16e8.47636291.webp'),
(1605, 843, '/uploads/fig_6920797f1e5d28.54865322.webp'),
(1606, 844, '/uploads/fig_69207a635bafc1.48671886.webp'),
(1607, 844, '/uploads/fig_69207a635bf517.47593009.webp'),
(1608, 845, '/uploads/fig_69207ba7064009.77340203.webp'),
(1609, 845, '/uploads/fig_69207ba7068722.19505039.webp'),
(1610, 846, '/uploads/fig_69207db2f0cf50.02538831.webp'),
(1611, 847, '/uploads/fig_69207e3d6c9469.75518196.webp'),
(1612, 847, '/uploads/fig_69207e3d6d2f89.57921381.webp'),
(1614, 848, '/uploads/fig_69208bc950dda5.83487550.webp'),
(1615, 848, '/uploads/fig_69208bd6150090.63608209.webp'),
(1617, 849, '/uploads/fig_69208d305f0329.64507961.webp'),
(1618, 849, '/uploads/fig_69208d4254b2f6.61190077.webp'),
(1619, 850, '/uploads/fig_69209b4213a870.06865565.webp'),
(1620, 850, '/uploads/fig_69209b4213f531.33230686.webp'),
(1621, 851, '/uploads/fig_69209bf5009855.32228456.webp'),
(1622, 851, '/uploads/fig_69209bf500e556.42447442.webp'),
(1623, 852, '/uploads/fig_69235105bfc765.54866857.webp'),
(1624, 852, '/uploads/fig_69235105c01379.65806661.webp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensaje`
--

CREATE TABLE `mensaje` (
  `id` int(11) NOT NULL,
  `emisor_id` int(11) NOT NULL,
  `receptor_id` int(11) NOT NULL,
  `contenido` longtext NOT NULL,
  `fecha_envio` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `leido` tinyint(1) NOT NULL,
  `figura_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `mensaje`
--

INSERT INTO `mensaje` (`id`, `emisor_id`, `receptor_id`, `contenido`, `fecha_envio`, `leido`, `figura_id`) VALUES
(50, 22, 18, 'Bienvenido a FiguMarket, cualquier duda aquí.', '2025-11-13 05:23:01', 1, NULL),
(56, 18, 22, 'cada cuanto añadis nuevas figuras?', '2025-11-14 19:44:01', 1, NULL),
(65, 20, 21, 'Hola, me interesa tu figura \"GENERAL GRIEVOUS FIGURA SIDESHOW\". ¿Está disponible?', '2025-11-21 18:24:43', 1, 841),
(66, 21, 19, 'Hola, me interesa tu figura \"Hot Toys Terminator Génesis Endosqueleton MMS352\". ¿Está disponible?', '2025-11-21 18:38:31', 1, 822),
(67, 19, 21, 'Si', '2025-11-21 18:39:26', 1, 822),
(68, 21, 19, 'Hola', '2025-11-23 17:08:20', 1, 822),
(69, 21, 19, 'Que tal', '2025-11-23 17:08:25', 1, 822),
(70, 21, 19, 'Estas', '2025-11-23 17:08:27', 1, 822),
(71, 21, 19, 'Como va todo', '2025-11-23 17:08:30', 1, 822),
(72, 21, 19, 'Esyoy bien', '2025-11-23 17:08:34', 1, 822),
(73, 21, 19, 'Y tu?', '2025-11-23 17:08:38', 1, 822),
(74, 19, 21, 'Todo bien', '2025-11-27 20:40:25', 1, 822),
(75, 21, 19, 'Ok', '2025-11-27 21:26:26', 1, 822);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `noticia`
--

CREATE TABLE `noticia` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `resumen` varchar(255) DEFAULT NULL,
  `descripcion` longtext DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `creada_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `noticia`
--

INSERT INTO `noticia` (`id`, `titulo`, `resumen`, `descripcion`, `imagen`, `url`, `creada_at`) VALUES
(11, 'S.H Figuarts General Grievous (STAR WARS: Revenge of the Sith)', 'Un capaz estratega militar separatista y temible cazador de Jedis. El General Grievous de Star Wars Episodio 3: La Venganza de los Sith por fin está disponible en S.H.Figuarts. La capa está hecha de tela metálica y se puede quitar y posar. Los brazos pued', 'Para celebrar el 20º aniversario de Star Wars Episodio III: La venganza de los Sith, el General Grievous aparece por fin en S.H.Figuarts en un gran volumen de 190 mm de altura. La figura de cuatro brazos también puede reproducirse utilizando piezas de recambio.\n\n· Cuerpo principal\n· Dos piezas de muñeca de reemplazo a izquierda y derecha\n· Completa las partes del brazo para el reemplazo\n- 4 tipos de sables de luz\n・Capa de tela\n· Conjunto exclusivo de pedestal', 'http://tamashiiweb.com/images/item/item_0000015321_Q8hxmpvb_103.jpg', 'https://tamashiiweb.com/item/15321/?wovn=es', '2025-11-21 17:15:30'),
(12, 'S.H Figuarts SUPER SAIYAN SON GOKU (THE GAMES BEGIN)', '¡Versión completamente esculpida de S.H.Figuarts de \'SUPER SAIYAN GOKU\' con el traje del Arco de la Célula en adelante de \'DRAGON BALL Z\'!', 'La figura ha sido recreada en una forma tridimensional completamente nueva, con atención al detalle basada en las proporciones, el volumen del cabello y las expresiones faciales del anime original.', 'https://tamashiiweb.com/images/item/item_0000015355_NBXC70bM_01.jpg', 'https://tamashiiweb.com/item/15355/?wovn=es', '2025-11-21 17:17:59'),
(13, 'MAFEX Wolverine de Deadpool & Wolverine', 'La Mafex de Wolverine basada en Deadpool & Wolverine viene con el traje amarillonegro súper fiel a la peli y un acabado brutal en detalles. La articulación es muy buena, así que puedes ponerlo en poses bastante bestias sin que pierda estabilidad. Incluye ', 'Nuestro mutante favorito de la mano de MAFEX llega con su nueva representación con el clásico traje amarillo en su adaptación en la película Deadpool & Wolverine', 'https://www.medicomtoy.co.jp/WI/upimage/0009_250824_4p48b7_h.jpg', 'https://www.medicomtoy.co.jp/prod/dt/27/1/20449.html', '2025-11-21 17:24:38'),
(14, 'Pre Order SideShow Dek de Predator: Badlands', 'Sideshow y  Hot Toys  presentan con orgullo la figura coleccionable a escala 1/6 de Dek , que captura la fuerza del guerrero con un realismo excepcional. Esta  figura de acción de ciencia ficción   presenta una cabeza esculpida de nuevo desarrollo con ojo', '', 'https://www.sideshow.com/cdn-cgi/image/quality=90,f=auto/https://www.sideshow.com/storage/product-images/915076/hot-toys-predator-dek-sixth-scale-figure-gallery-691755e85c715.jpg', 'https://www.sideshow.com/collectibles/predator-dek-hot-toys-915076', '2025-11-25 13:16:07'),
(15, 'INART presenta a Batman de The Dark Knight', 'Inspirada en El Caballero Oscuro, esta figura de Batman en escala 1:2 combina presencia imponente y detalle de colección. El traje reproduce con precisión cada textura de la armadura, la capa cae con naturalidad y el esculpido facial captura a la perfecci', '1 Cabeza Esculpida Estándar con Máscara\n1 Escultura de Cabeza Desenmascarada\n1 Cuerpo Totalmente Articulado\n3 Placas de Rostro Intercambiables\n9 Juegos de Manos Intercambiables, Incluyendo:\n1 Par de Puños Cerrados\n1 Par de Manos Abiertas\n1 Par de Manos Relajadas\n1 Mano Izquierda para Sostener el Lanzabombas Adhesivas\n1 Mano Derecha para Sostener el Lanzabombas Adhesivas\n1 Mano Izquierda para Sostener el Rifle EMP\n1 Mano Derecha para Sostener el Rifle EMP\n1 Mano Derecha para Sostener el Batarang\n1 Mano Derecha para Sostener el Lanzador de Garfios\n1 Capa Desmontable con Pliegues', 'https://global.inart.studio/cdn/shop/files/28.BatmanactionfigurefeaturingiconicdesignfromTheDarkKnightRises.png?v=1743133580&width=500', 'https://global.inart.studio/es/products/the-dark-knight-rises-batman-1-12-scale-figure-deluxe', '2025-11-25 13:39:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimientos`
--

CREATE TABLE `seguimientos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `figura_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `seguimientos`
--

INSERT INTO `seguimientos` (`id`, `usuario_id`, `figura_id`, `created_at`) VALUES
(14, 20, 824, '2025-11-26 18:00:55'),
(19, 21, 849, '2025-11-27 21:12:05'),
(21, 21, 851, '2025-11-27 21:21:51'),
(22, 19, 845, '2025-11-27 21:35:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `fecha_registro` datetime NOT NULL COMMENT '(DC2Type:datetime_immutable)',
  `foto_perfil` varchar(255) DEFAULT NULL,
  `rol` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `email`, `contrasena`, `fecha_registro`, `foto_perfil`, `rol`) VALUES
(18, 'Ana Pérez', 'ana@example.com', '$2y$10$sWFcYBpNnRS2dEHq5j.72OTwI4RAVjDFqZZxhzGWFKRBTPIh.YjY.', '2025-11-13 05:23:01', '/uploads/perfiles/773f919e5bf635c0.jpg', 'usuario'),
(19, 'Bruno Díaz', 'bruno@example.com', '$2y$10$FaaZc48LY2MdKNcdtwn8QO2pluFCx6Q0u0H7XNDVbSWnsvm0tYu/W', '2025-11-13 05:23:01', 'https://i.pravatar.cc/150?img=2', 'usuario'),
(20, 'Carla Gómez', 'carla@example.com', '$2y$10$B1UvU326HQR6ZD2pMH6qjeHwcAA.kAapvu3EV6nCc2QGffP6YEsTy', '2025-11-13 05:23:01', '/uploads/perfiles/6af5dc638956e288.png', 'usuario'),
(21, 'Diego López', 'diego@example.com', '$2y$10$/piKLelEKeLMg/EzYqQsTOipDiGjzSe.BVHWVQfl4LSDxTT2fxMf6', '2025-11-13 05:23:01', '/uploads/perfiles/5f8500dbeca2fcbc.png', 'usuario'),
(22, 'Admin Figu', 'admin@example.com', '$2y$10$wd8.5.vcbuHLkJgkmZbbsODig6U7UNtT0XyUfSlVcDUs3YSrKM.gq', '2025-11-13 05:23:01', 'https://i.pravatar.cc/150?img=5', 'admin');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `conversacion_archivada`
--
ALTER TABLE `conversacion_archivada`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_archivo_owner_otro_figura` (`owner_id`,`otro_usuario_id`,`figura_id`),
  ADD KEY `IDX_ARCH_OWNER` (`owner_id`),
  ADD KEY `FK_ARCHIVADA_FIGURA` (`figura_id`);

--
-- Indices de la tabla `doctrine_migration_versions`
--
ALTER TABLE `doctrine_migration_versions`
  ADD PRIMARY KEY (`version`);

--
-- Indices de la tabla `figura`
--
ALTER TABLE `figura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_283A7763DB38439E` (`usuario_id`);

--
-- Indices de la tabla `imagen`
--
ALTER TABLE `imagen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_8319D2B38AA286E2` (`figura_id`);

--
-- Indices de la tabla `mensaje`
--
ALTER TABLE `mensaje`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_9B631D016BDF87DF` (`emisor_id`),
  ADD KEY `IDX_9B631D01386D8D01` (`receptor_id`),
  ADD KEY `IDX_MENSAJE_FIGURA_ID` (`figura_id`);

--
-- Indices de la tabla `noticia`
--
ALTER TABLE `noticia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `IDX_NOTICIA_CREADA_AT` (`creada_at`);

--
-- Indices de la tabla `seguimientos`
--
ALTER TABLE `seguimientos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_usuario_figura` (`usuario_id`,`figura_id`),
  ADD KEY `idx_seguimientos_usuario` (`usuario_id`),
  ADD KEY `idx_seguimientos_figura` (`figura_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQ_2265B05DE7927C74` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `conversacion_archivada`
--
ALTER TABLE `conversacion_archivada`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `figura`
--
ALTER TABLE `figura`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=853;

--
-- AUTO_INCREMENT de la tabla `imagen`
--
ALTER TABLE `imagen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1625;

--
-- AUTO_INCREMENT de la tabla `mensaje`
--
ALTER TABLE `mensaje`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT de la tabla `noticia`
--
ALTER TABLE `noticia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `seguimientos`
--
ALTER TABLE `seguimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `conversacion_archivada`
--
ALTER TABLE `conversacion_archivada`
  ADD CONSTRAINT `FK_ARCHIVADA_FIGURA` FOREIGN KEY (`figura_id`) REFERENCES `figura` (`id`);

--
-- Filtros para la tabla `figura`
--
ALTER TABLE `figura`
  ADD CONSTRAINT `FK_283A7763DB38439E` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `imagen`
--
ALTER TABLE `imagen`
  ADD CONSTRAINT `FK_8319D2B38AA286E2` FOREIGN KEY (`figura_id`) REFERENCES `figura` (`id`);

--
-- Filtros para la tabla `mensaje`
--
ALTER TABLE `mensaje`
  ADD CONSTRAINT `FK_9B631D01386D8D01` FOREIGN KEY (`receptor_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `FK_9B631D016BDF87DF` FOREIGN KEY (`emisor_id`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `FK_MENSAJE_FIGURA` FOREIGN KEY (`figura_id`) REFERENCES `figura` (`id`);

--
-- Filtros para la tabla `seguimientos`
--
ALTER TABLE `seguimientos`
  ADD CONSTRAINT `fk_seguimientos_figura` FOREIGN KEY (`figura_id`) REFERENCES `figura` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_seguimientos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
