import React, { useState, useEffect, useRef } from "react";
import './TicTacToe.css';
import circle_icon from '../Assets/circle.png';
import cross_icon from '../Assets/cross.png';

const TicTacToe = () => {
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(''));
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [symbol, setSymbol] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Connexion WebSocket
    wsRef.current = new WebSocket('ws://localhost:3001');

    wsRef.current.onmessage = (event) => {
      console.log('Message reçu:', event.data);
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'match_start':
          console.log('Match start:', data.match);
          setGameStarted(true);
          setMatchId(data.match.id);
          setSymbol(data.match.yourSymbol);
          // X commence toujours
          setIsMyTurn(data.match.yourSymbol === 'X');
          setError(data.match.yourSymbol === 'X' ? 'C\'est votre tour' : 'Tour de l\'adversaire');
          break;

        case 'update_board':
          console.log('Board updated:', data);
          setBoard(data.board);
          if (data.winner) {
            setError(data.winner === 'draw' ? 'Match nul !' : `Le joueur ${data.winner} a gagné !`);
            setGameStarted(false);
          } else {
            // Si c'est nous qui avons joué, on attend notre tour
            // Si c'est l'adversaire qui a joué, c'est notre tour
            const wasMyMove = data.lastPlayer === symbol;
            setIsMyTurn(!wasMyMove);
            setError(wasMyMove ? 'Tour de l\'adversaire' : 'C\'est votre tour');
          }
          break;

        case 'error':
          setError(data.message);
          break;

        case 'game_over':
          setError(data.message);
          setGameStarted(false);
          break;
      }
    };

    wsRef.current.onerror = () => {
      setError('Erreur de connexion au serveur');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const joinQueue = () => {
    if (!playerName.trim()) {
      setError('Veuillez entrer votre pseudo');
      return;
    }

    const message = {
      type: 'join_queue',
      pseudo: playerName
    };
    console.log('Envoi du message:', message);
    wsRef.current.send(JSON.stringify(message));

    setError('En attente d\'un autre joueur...');
  };

  const sendMove = (index) => {
    if (!matchId || !gameStarted) return;

    wsRef.current.send(JSON.stringify({
      type: 'play_turn',
      matchId,
      symbol: symbol,
      index: index
    }));

    // On ne change pas le tour tout de suite
    // On attend la confirmation du serveur via update_board
  };

  const handleClick = (index) => {
    if (!gameStarted || board[index] !== '') {
      return;
    }

    if (!isMyTurn) {
      setError('Ce n\'est pas votre tour');
      return;
    }

    sendMove(index);
  };

  const renderCell = (index) => {
    const value = board[index];
    if (!value) return null;
    return <img src={value === 'X' ? cross_icon : circle_icon} alt={value} />;
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayerName('');
    setIsMyTurn(false);
    setMatchId(null);
    setBoard(Array(9).fill(''));
    setSymbol(null);
    setError(null);

    // Reconnexion au WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }
    wsRef.current = new WebSocket('ws://localhost:3001');
  }
  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      
      {!gameStarted ? (
        <div className="player-setup">
          <input
            type="text"
            placeholder="Entrez votre pseudo"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={joinQueue}>Rejoindre une partie</button>
        </div>
      ) : (
        <div>
          <div className="player-info">
            {symbol === 'X' ? 'Vous jouez avec X' : 'Vous jouez avec O'} - 
            {isMyTurn ? 'C\'est votre tour' : 'Tour de l\'adversaire'}
          </div>
      <h1 className="title">Le jeu du <span>Morpion</span></h1>
      <div className="board">
        {[0, 1, 2].map(row =>
          <div className={`row${row + 1}`} key={row}>
            {[0, 1, 2].map(col => {
              const index = row * 3 + col;
              return (
                <div
                  key={index}
                  className="boxes"
                  onClick={() => handleClick(index)}
                >
                  {renderCell(index)}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button className="reset" onClick={resetGame}>Recommencer</button>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
