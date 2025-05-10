import React, { useState } from "react";
import './TicTacToe.css';
import circle_icon from '../Assets/circle.png';
import cross_icon from '../Assets/cross.png';

let data = ["", "", "", "", "", "", "", "", ""];

const TicTacToe = () => {
  const [count, setCount] = useState(0);
  const [lock, setLock] = useState(false);

  const toggle = (e, num) => {
    if (lock || data[num] !== "") return;

    if (count % 2 === 0) {
      e.target.innerHTML = `<img src='${cross_icon}' alt='X'/>`;
      data[num] = "x";
    } else {
      e.target.innerHTML = `<img src='${circle_icon}' alt='O'/>`;
      data[num] = "o";
    }

    setCount(count + 1);
    checkWin();
  };

  const checkWin = () => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (data[a] && data[a] === data[b] && data[b] === data[c]) {
        won(data[a]);
        return;
      }
    }
  };

  const won = (winner) => {
    setLock(true);
    alert(`Le joueur ${winner.toUpperCase()} a gagné !`);
  };

  const resetGame = () => {
    data = ["", "", "", "", "", "", "", "", ""];
    setCount(0);
    setLock(false);
    const boxes = document.querySelectorAll(".boxes");
    boxes.forEach((box) => (box.innerHTML = ""));
  };

  return (
    <div className="container">
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
                  onClick={(e) => toggle(e, index)}
                ></div>
              );
            })}
          </div>
        )}
      </div>
      <button className="reset" onClick={resetGame}>Recommencer</button>
    </div>
  );
};

export default TicTacToe;
