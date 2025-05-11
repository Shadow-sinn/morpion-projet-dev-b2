const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { addToQueue, matches } = require("./matchmaking");  // Importation de la logique de matchmaking
const { checkWinner } = require("./gameLogic"); // Importation de la logique de jeu

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Liste des joueurs actifs
let activePlayers = [];

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // Gestion du message pour rejoindre la file d'attente
    if (data.type === "join_queue") {
      // Vérifier si le pseudo est déjà dans la file d'attente
      if (activePlayers.some(player => player.pseudo === data.pseudo)) {
        ws.send(JSON.stringify({ type: "error", message: "Pseudo déjà pris." }));
        return;
      }

      // Ajouter à la file d'attente
      addToQueue({ pseudo: data.pseudo, ip: ws._socket.remoteAddress, socket: ws });

      // Ajouter le joueur à la liste des joueurs actifs
      activePlayers.push({ pseudo: data.pseudo, socket: ws });
    }

    // Gestion du message pour jouer un tour
    if (data.type === "play_turn") {
      let match = matches.find((m) => m.id === data.matchId);
      if (!match || match.isFinished) {
        ws.send(JSON.stringify({ type: "error", message: "Match terminé ou non trouvé." }));
        return;
      }

      // Vérifier si c'est le tour du joueur
      let currentSymbol = match.currentPlayer === 1 ? match.player1Symbol : match.player2Symbol;
      if (data.symbol !== currentSymbol) {
        ws.send(JSON.stringify({ type: "error", message: "Ce n'est pas votre tour." }));
        return;
      }

      // Mettre à jour le plateau
      match.board[data.index] = data.symbol;
      let winner = checkWinner(match.board);

      if (winner) {
        match.isFinished = true;
        match.winner = winner !== "draw" ? winner : "draw";
      }

      // Envoyer la mise à jour aux deux joueurs
      match.player1.socket.send(JSON.stringify({ type: "update_board", board: match.board, winner }));
      match.player2.socket.send(JSON.stringify({ type: "update_board", board: match.board, winner }));
      
      // Passer au joueur suivant
      match.currentPlayer = match.currentPlayer === 1 ? 2 : 1;
    }
  });

  // Gérer la déconnexion d'un joueur
  ws.on("close", () => {
    console.log("Un joueur s'est déconnecté.");
    
    // Retirer du matchmaking ou de la liste des joueurs actifs
    activePlayers = activePlayers.filter(player => player.socket !== ws);
    
    // Gérer les matchs
    matches.forEach((match) => {
      if (match.player1.socket === ws || match.player2.socket === ws) {
        match.isFinished = true;
        const winner = match.player1.socket === ws ? match.player2 : match.player1;
        winner.socket.send(JSON.stringify({ type: "game_over", message: "L'autre joueur s'est déconnecté." }));
      }
    });
  });
});

server.listen(3001, () => console.log("Serveur WebSocket sur port 3001"));


