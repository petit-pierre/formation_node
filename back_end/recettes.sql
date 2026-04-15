-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 15 avr. 2026 à 12:15
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `recettes`
--

-- --------------------------------------------------------

--
-- Structure de la table `recettes`
--

CREATE TABLE `recettes` (
  `id` int(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `etapes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`etapes`)),
  `userId` int(255) NOT NULL,
  `imageName` varchar(255) DEFAULT NULL,
  `youtube` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `recettes`
--

INSERT INTO `recettes` (`id`, `title`, `description`, `etapes`, `userId`, `imageName`, `youtube`, `status`) VALUES
(90, 'tarte aux citron', 'une délicieuse recette par omar', '[\"battez les oeufs\",\"ne mangez pas tout le chocolat\"]', 4, '335040_tiny_1774261108701.mp4', 'NnbpMYpK-6w', 'visible'),
(94, 'brownie', 'c\'est bon ..........................', '[\"zou: au four\"]', 4, NULL, NULL, 'visible'),
(102, 'testing', 'tagadadadadada\ntagadadadadada\ntagadadadadada', '[\"tagadadadadada\\ntagadadadadada\",\"tagadadadadada\\ntagadadadadada\"]', 4, '335040_tiny_1775044216520.mp4', '1dhu-NGs4eU', 'visible');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(60) NOT NULL,
  `role` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(4, 'pierre2', '$2b$10$Nm7nSDGZpBOJAMYlEXrUDuGRZWNHWoh.kG5QbOQGjVeu3ygWOAzjq', 'admin'),
(5, 'josue', '$2b$10$.aTZ0Q/.CWEVoy4SSLpg1Oi0wbxeFDeu7ZXCHPxJrx4mUkBT2NXOq', NULL);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `recettes`
--
ALTER TABLE `recettes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `recettes`
--
ALTER TABLE `recettes`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
