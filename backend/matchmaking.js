const pool = require("./database");

const queue = [];

async function addToQueue(player) {
  queue.push(player);
  await pool.query("INSERT INTO queue (pseudo, ip) VALUES (?, ?)", [player.pseudo, player.ip]);
  checkForMatch();
}

async function checkForMatch() {
  if (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();

    const board = Array(9).fill(null);
    const match = {
      id: Date.now(),
      player1,
      player2,
      board: JSON.stringify(board),
      isFinished: false,
      winner: null
    };

    await pool.query("INSERT INTO matches (player1, player2, board, is_finished) VALUES (?, ?, ?, ?)", 
      [player1.pseudo, player2.pseudo, JSON.stringify(board), false]);

    player1.socket.send(JSON.stringify({ type: "match_start", match }));
    player2.socket.send(JSON.stringify({ type: "match_start", match }));
  }
}

module.exports = { addToQueue };
