const { v4: uuidv4 } = require('uuid');  // Importer la fonction v4 de uuid
const pool = require("./database");

const queue = [];
// Liste des matchs en cours, déplacée ici
let matches = [];

async function addToQueue(player) {
  // Ajout du joueur à la file d'attente et insertion dans la base de données
  queue.push(player);
  await pool.query("INSERT INTO queue (pseudo, ip) VALUES (?, ?)", [player.pseudo, player.ip]);

  // Vérification des matches disponibles
  checkForMatch();
}

async function checkForMatch() {
  // Si 2 joueurs sont dans la queue, on peut commencer un match
  if (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();

    const board = Array(9).fill(null); // Initialisation du plateau de jeu
    const match = {
      id: uuidv4(),  // Utilisation de uuid pour générer un identifiant unique
      player1,
      player2,
      board: board, // Le plateau est un tableau pour pouvoir l'enregistrer
      isFinished: false,
      winner: null,
      currentPlayer: 1, // Le joueur 1 commence
      player1Symbol: "X", // Assigner le symbole X au joueur 1
      player2Symbol: "O"  // Assigner le symbole O au joueur 2
    };

    // Ajouter le match à la liste des matchs en cours
    matches.push(match);

    // Envoi des informations de début de match à chaque joueur
    player1.socket.send(JSON.stringify({
      type: "match_start",
      match: {
        id: match.id,
        board: match.board,  // Envoie du plateau
        yourSymbol: match.player1Symbol, // Assignation du symbole X au joueur 1
        opponent: {
          pseudo: player2.pseudo, // Pseudo de l'adversaire
          ip: player2.ip // IP de l'adversaire
        }
      }
    }));

    player2.socket.send(JSON.stringify({
      type: "match_start",
      match: {
        id: match.id,
        board: match.board,  // Envoie du plateau
        yourSymbol: match.player2Symbol, // Assignation du symbole O au joueur 2
        opponent: {
          pseudo: player1.pseudo, // Pseudo de l'adversaire
          ip: player1.ip // IP de l'adversaire
        }
      }
    }));

    console.log(`Match ${match.id} ajouté avec succès.`);
  }
}

module.exports = { addToQueue, matches };
