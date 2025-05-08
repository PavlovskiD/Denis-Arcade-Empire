import React, { useEffect, useRef, useState } from "react";
import "./SpaceInvaders.css";
import submitScore from "../../SubmitScore";

const SpaceInvaders = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const lastShotTime = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameId, setGameId] = useState(0);

  const canvasWidth = 800;
  const canvasHeight = 600;
  const shootCooldown = 300; // ms

  const gameState = useRef({
    player: {
      x: canvasWidth / 2 - 25,
      y: canvasHeight - 50,
      width: 50,
      height: 20,
      className: "spaceInvadersPlayer"
    },
    bullets: [],
    invaders: [],
    invaderSpeed: 1,
  });

  const keysPressed = useRef({
    ArrowLeft: false,
    ArrowRight: false,
  });

  const initializeInvaders = () => {
    const invaders = [];
    const rows = 5;
    const cols = 10;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        invaders.push({
          x: col * 60 + 40,
          y: row * 40 + 20,
          width: 40,
          height: 20,
          className: `spaceInvader-${row}-${col}`,
        });
      }
    }
    gameState.current.invaders = invaders;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateGame = () => {
      if (isPlaying) {
        // Player movement with bounds
        if (keysPressed.current.ArrowLeft && gameState.current.player.x > 0) {
          gameState.current.player.x -= 5;
        }
        if (
          keysPressed.current.ArrowRight &&
          gameState.current.player.x + gameState.current.player.width < canvasWidth
        ) {
          gameState.current.player.x += 5;
        }

        // Update bullets
        gameState.current.bullets.forEach((bullet, index) => {
          bullet.y -= 5;
          if (bullet.y < 0) {
            gameState.current.bullets.splice(index, 1);
          }
        });

        // Move invaders
        gameState.current.invaders.forEach((invader) => {
          invader.x += gameState.current.invaderSpeed;
        });

        // Change direction if edge hit
        let changeDirection = false;
        gameState.current.invaders.forEach((invader) => {
          if (invader.x < 0 || invader.x + invader.width > canvasWidth) {
            changeDirection = true;
          }
        });

        if (changeDirection) {
          gameState.current.invaderSpeed *= -1;
          gameState.current.invaders.forEach((invader) => {
            invader.y += 20;
          });
        }

        // Collision detection with safe removal
        const bulletsToRemove = new Set();
        const invadersToRemove = new Set();

        gameState.current.bullets.forEach((bullet, bulletIndex) => {
          gameState.current.invaders.forEach((invader, invaderIndex) => {
            if (
              bullet.x < invader.x + invader.width &&
              bullet.x + bullet.width > invader.x &&
              bullet.y < invader.y + invader.height &&
              bullet.y + bullet.height > invader.y
            ) {
              bulletsToRemove.add(bulletIndex);
              invadersToRemove.add(invaderIndex);
              setScore((prev) => prev + 100);
            }
          });
        });

        gameState.current.bullets = gameState.current.bullets.filter((_, i) => !bulletsToRemove.has(i));
        gameState.current.invaders = gameState.current.invaders.filter((_, i) => !invadersToRemove.has(i));

        // Win condition
        if (gameState.current.invaders.length === 0) {
          stopGame();
          alert("You win!");
        }

        // Game over condition
        const reachedBottom = gameState.current.invaders.some(
          (invader) => invader.y + invader.height >= gameState.current.player.y
        );
        if (reachedBottom) {
          stopGame();
          alert("Game Over!");
        }
      }

      draw(ctx);
      animationRef.current = requestAnimationFrame(updateGame);
    };

    const draw = (ctx) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Player
      ctx.fillStyle = "green";
      ctx.fillRect(
        gameState.current.player.x,
        gameState.current.player.y,
        gameState.current.player.width,
        gameState.current.player.height
      );

      // Bullets
      ctx.fillStyle = "red";
      gameState.current.bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });

      // Invaders
      ctx.fillStyle = "blue";
      gameState.current.invaders.forEach((invader) => {
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
      });

      // Score
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, 10, 20);
    };

    animationRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, gameId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;

      if (e.key === " " && isPlaying) {
        const now = Date.now();
        if (now - lastShotTime.current > shootCooldown) {
          gameState.current.bullets.push({
            x: gameState.current.player.x + gameState.current.player.width / 2 - 2.5,
            y: gameState.current.player.y,
            width: 5,
            height: 10,
            className: `spaceInvadersBullet-${Date.now()}`,
          });
          lastShotTime.current = now;
        }
      }
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
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    initializeInvaders();
    setIsPlaying(true);
    setGameId((id) => id + 1);
  };

  const stopGame = () => {
    submitScore(score);
    setIsPlaying(false);
  };

  return (
    <div className="spaceInvadersGame-container">
      <h1>Space Invaders Game</h1>
      <div className="spaceInvadersGame-controls">
        <button className="spaceStart" onClick={startGame}>
          Start Game
        </button>
        <button className="spaceStop" onClick={stopGame}>
          Stop Game
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="spaceInvadersGame-canvas"
      />
      <div className="spaceInvadersGame-scoreboard">
        <p>Score: {score}</p>
      </div>
    </div>
  );
};

export default SpaceInvaders;
