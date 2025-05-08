import React, { useState, useEffect } from "react";
import "./MemoryGame.css";

import pacman from "./pic1.png";
import spaceInvader from "./pic2.png";
import mario from "./pic3.png";
import donkeyKong from "./pic4.png";
import tetris from "./pic5.png";
import galaga from "./pic6.png";
import cardBack from "./pic7.png"; 

const cardImages = [
  { src: pacman, matched: false },
  { src: spaceInvader, matched: false },
  { src: mario, matched: false },
  { src: donkeyKong, matched: false },
  { src: tetris, matched: false },
  { src: galaga, matched: false },
];

function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);

  // Shuffle cards
  const shuffleCards = () => {
    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }));

    setCards(shuffledCards);
    setTurns(0);
    setChoiceOne(null);
    setChoiceTwo(null);
  };

  const handleChoice = (card) => {
    if (!disabled) {
      choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
    }
  };

  // Compare two selected cards
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.src === choiceTwo.src) {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.src === choiceOne.src ? { ...card, matched: true } : card
          )
        );
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  // Reset choices and increase turn
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };

  // Start game automatically
  useEffect(() => {
    shuffleCards();
  }, []);

  return (
    <div className="App">
      <h1 className="head">8-Bit Memory Game</h1>
      <button className="str" onClick={shuffleCards}>New Game</button>
      <div className="card-grid">
        {cards.map((card) => (
          <div
            className={`card ${
              choiceOne === card || choiceTwo === card || card.matched
                ? "flipped"
                : ""
            }`}
            key={card.id}
            onClick={() => handleChoice(card)}
          >
            <div className="card-inner">
              <div className="card-front">
                <img src={card.src} alt="card" />
              </div>
              <div className="card-back">
                <img src={cardBack} alt="card back" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p>Turns: {turns}</p>
    </div>
  );
}

export default MemoryGame;