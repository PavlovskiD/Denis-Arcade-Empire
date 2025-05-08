import React, { useEffect, useRef, useState } from "react";
import "./PongGame.css";
import submitScore from "../../SubmitScore";

const PongGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  // Game mode: "computer" or "multiplayer"
  const [mode, setMode] = useState("computer");
  // Dummy state for re-rendering score changes
  const [scoreUpdate, setScoreUpdate] = useState(0);

  // Canvas dimensions
  const canvasWidth = 800;
  const canvasHeight = 400;

  // Store game data in a mutable ref
  const gameState = useRef({
    // Ball settings
    ballX: canvasWidth / 2,
    ballY: canvasHeight / 2,
    ballSpeedX: 4,
    ballSpeedY: 4,
    ballRadius: 10,
    // Paddle settings
    paddleWidth: 10,
    paddleHeight: 100,
    leftPaddleX: 20,
    rightPaddleX: canvasWidth - 20 - 10, // 20px from right + paddle width
    leftPaddleY: canvasHeight / 2 - 50,
    rightPaddleY: canvasHeight / 2 - 50,
    // Scores
    leftScore: 0,
    rightScore: 0,
    // Game running flag
    isPlaying: false,
  });

  // For smooth paddle motion, we'll track the keys currently pressed.
  // This object will be updated on keydown/keyup events.
  const keysPressed = useRef({
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
  });

  // Register global keydown and keyup listeners to set key states.
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Resets the ball position and reverses horizontal direction after a score.
    const resetBall = () => {
      gameState.current.ballX = canvasWidth / 2;
      gameState.current.ballY = canvasHeight / 2;
      gameState.current.ballSpeedX = -gameState.current.ballSpeedX;
      gameState.current.ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
    };

    const updateGame = () => {
      if (gameState.current.isPlaying) {
        // Update ball position
        gameState.current.ballX += gameState.current.ballSpeedX;
        gameState.current.ballY += gameState.current.ballSpeedY;

        // Bounce off top and bottom walls
        if (
          gameState.current.ballY - gameState.current.ballRadius < 0 ||
          gameState.current.ballY + gameState.current.ballRadius > canvasHeight
        ) {
          gameState.current.ballSpeedY = -gameState.current.ballSpeedY;
        }

        // Collision with left paddle
        if (
          gameState.current.ballX - gameState.current.ballRadius <
            gameState.current.leftPaddleX + gameState.current.paddleWidth &&
          gameState.current.ballY > gameState.current.leftPaddleY &&
          gameState.current.ballY <
            gameState.current.leftPaddleY + gameState.current.paddleHeight
        ) {
          gameState.current.ballSpeedX = -gameState.current.ballSpeedX;
        }

        // Collision with right paddle
        if (
          gameState.current.ballX + gameState.current.ballRadius >
            gameState.current.rightPaddleX &&
          gameState.current.ballY > gameState.current.rightPaddleY &&
          gameState.current.ballY <
            gameState.current.rightPaddleY + gameState.current.paddleHeight
        ) {
          gameState.current.ballSpeedX = -gameState.current.ballSpeedX;
        }

        // Score for right player if ball goes off the left side
        if (gameState.current.ballX - gameState.current.ballRadius < 0) {
          gameState.current.rightScore += 1;
          setScoreUpdate((s) => s + 1);
          resetBall();
        }

        // Score for left player if ball goes off the right side
        if (gameState.current.ballX + gameState.current.ballRadius > canvasWidth) {
          gameState.current.leftScore += 1;
          setScoreUpdate((s) => s + 1);
          resetBall();
        }

        // Update left paddle position based on keys (W/S)
        if (keysPressed.current["w"] || keysPressed.current["W"]) {
          gameState.current.leftPaddleY -= 5;
        }
        if (keysPressed.current["s"] || keysPressed.current["S"]) {
          gameState.current.leftPaddleY += 5;
        }
        // Clamp the left paddle
        if (gameState.current.leftPaddleY < 0)
          gameState.current.leftPaddleY = 0;
        if (
          gameState.current.leftPaddleY + gameState.current.paddleHeight >
          canvasHeight
        )
          gameState.current.leftPaddleY = canvasHeight - gameState.current.paddleHeight;

        // Update right paddle movement
        if (mode === "multiplayer") {
          // For multiplayer, use Arrow keys for the right paddle
          if (keysPressed.current["ArrowUp"]) {
            gameState.current.rightPaddleY -= 5;
          }
          if (keysPressed.current["ArrowDown"]) {
            gameState.current.rightPaddleY += 5;
          }
          // Clamp the right paddle
          if (gameState.current.rightPaddleY < 0)
            gameState.current.rightPaddleY = 0;
          if (
            gameState.current.rightPaddleY + gameState.current.paddleHeight >
            canvasHeight
          )
            gameState.current.rightPaddleY = canvasHeight - gameState.current.paddleHeight;
        } else {
          // In computer mode, move the right paddle toward the ball
          if (
            gameState.current.ballY <
            gameState.current.rightPaddleY + gameState.current.paddleHeight / 2
          ) {
            gameState.current.rightPaddleY -= 4;
          } else {
            gameState.current.rightPaddleY += 4;
          }
          if (gameState.current.rightPaddleY < 0)
            gameState.current.rightPaddleY = 0;
          if (
            gameState.current.rightPaddleY + gameState.current.paddleHeight >
            canvasHeight
          )
            gameState.current.rightPaddleY = canvasHeight - gameState.current.paddleHeight;
        }
      }

      draw(ctx);
      animationRef.current = requestAnimationFrame(updateGame);
    };

    const draw = (ctx) => {
      // Clear and fill the canvas background
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw center dashed net
      ctx.strokeStyle = "white";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, 0);
      ctx.lineTo(canvasWidth / 2, canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw ball
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        gameState.current.ballX,
        gameState.current.ballY,
        gameState.current.ballRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw paddles
      ctx.fillRect(
        gameState.current.leftPaddleX,
        gameState.current.leftPaddleY,
        gameState.current.paddleWidth,
        gameState.current.paddleHeight
      );
      ctx.fillRect(
        gameState.current.rightPaddleX,
        gameState.current.rightPaddleY,
        gameState.current.paddleWidth,
        gameState.current.paddleHeight
      );

      // Display scores on the canvas
      ctx.fillStyle = "white";
      ctx.font = "32px Arial";
      ctx.fillText(gameState.current.leftScore, canvasWidth / 4, 50);
      ctx.fillText(gameState.current.rightScore, (canvasWidth * 3) / 4, 50);
    };

    animationRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animationRef.current);
  }, [mode, scoreUpdate]);

  // Start the game by (re)initializing positions and scores.
  const startGame = () => {
    gameState.current.isPlaying = true;
    gameState.current.leftScore = 0;
    gameState.current.rightScore = 0;
    gameState.current.ballX = canvasWidth / 2;
    gameState.current.ballY = canvasHeight / 2;
    gameState.current.ballSpeedX = 4 * (Math.random() > 0.5 ? 1 : -1);
    gameState.current.ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);
    gameState.current.leftPaddleY =
      canvasHeight / 2 - gameState.current.paddleHeight / 2;
    gameState.current.rightPaddleY =
      canvasHeight / 2 - gameState.current.paddleHeight / 2;
    setScoreUpdate((s) => s + 1);
  };

  // Stop the game.
  const stopGame = () => {
    submitScore(scoreUpdate);
    gameState.current.isPlaying = false;
  };

  return (
    <div className="pong-container">
      <h1>Pong Game</h1>
      <div className="game-controls">
        <button className="startG" onClick={startGame}>Start Game</button>
        <button className="stopG" onClick={stopGame}>Stop Game</button>
        <select 
          className="selectG"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            stopGame();
          }}
        >
          <option value="computer">Play Against Computer</option>
          <option value="multiplayer">Multiplayer</option>
        </select>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="pong-canvas"
      />
      <div className="scoreboard">
        <p>Left Score: {gameState.current.leftScore}</p>
        <p>Right Score: {gameState.current.rightScore}</p>
      </div>
    </div>
  );
};

export default PongGame;
