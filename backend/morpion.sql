CREATE DATABASE morpion;
USE morpion;

CREATE TABLE queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pseudo VARCHAR(50) NOT NULL,
  ip VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player1 VARCHAR(50) NOT NULL,
  player2 VARCHAR(50) NOT NULL,
  board TEXT NOT NULL,
  is_finished BOOLEAN DEFAULT FALSE,
  winner VARCHAR(50) NULL
);
