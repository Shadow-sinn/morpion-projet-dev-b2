-- Création de la base de données
DROP DATABASE IF EXISTS morpion;
CREATE DATABASE morpion;
USE morpion;

-- Table pour la file d'attente
CREATE TABLE queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pseudo VARCHAR(50) NOT NULL,
  ip VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les matchs (UUID comme identifiant)
CREATE TABLE matches (
  id CHAR(36) PRIMARY KEY, -- UUID (36 caractères)
  player1 VARCHAR(50) NOT NULL,
  player2 VARCHAR(50) NOT NULL,
  board TEXT NOT NULL,
  is_finished BOOLEAN DEFAULT FALSE,
  winner VARCHAR(50)
);