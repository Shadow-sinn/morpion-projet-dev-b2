const pool = require("./database");

const queue = [];

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
      id: Date.now(), // Utilisation de Date.now() pour générer un ID unique
      player1,
      player2,
      board: JSON.stringify(board), // Le plateau est un tableau JSON pour pouvoir l'enregistrer
      isFinished: false,
      winner: null
    };

    // Enregistrement du match dans la base de données
    await pool.query("INSERT INTO matches (player1, player2, board, is_finished) VALUES (?, ?, ?, ?)", 
      [player1.pseudo, player2.pseudo, JSON.stringify(board), false]);

    // Envoi des informations de début de match à chaque joueur
    player1.socket.send(JSON.stringify({
      type: "match_start",
      match: {
        id: match.id,
        board: match.board, // Envoie du plateau
        yourSymbol: "X", // Assignation du symbole X au joueur 1
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
        board: match.board, // Envoie du plateau
        yourSymbol: "O", // Assignation du symbole O au joueur 2
        opponent: {
          pseudo: player1.pseudo, // Pseudo de l'adversaire
          ip: player1.ip // IP de l'adversaire
        }
      }
    }));
  }
}

module.exports = { addToQueue };
