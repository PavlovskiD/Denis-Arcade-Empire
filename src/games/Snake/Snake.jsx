import React, { useState, useEffect } from "react";
import "./Snake.css";
import submitScore from "../../SubmitScore";
import supabase from "../../supabase/supabaseClient";

const gridSize = 20;
const initialSnake = [{ x: 10, y: 10 }];
const initialFood = { x: 5, y: 5 };

function Snake() {
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [direction, setDirection] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const [userName, setUserName] = useState("");
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const gameIdentifier = "snake";

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.username || "User");
      } else {
        window.location.href = "/login";
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("game", gameIdentifier) 
        .order("created_at", { ascending: true });

      if (!error) {
        setComments(data); 
      } else {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameStarted]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        let newSnake = [...prevSnake];
        let head = { ...newSnake[0] };

        switch (direction) {
          case "UP":
            head.y -= 1;
            break;
          case "DOWN":
            head.y += 1;
            break;
          case "LEFT":
            head.x -= 1;
            break;
          case "RIGHT":
            head.x += 1;
            break;
        }

        newSnake.unshift(head);

        if (
          head.x < 0 ||
          head.x >= gridSize ||
          head.y < 0 ||
          head.y >= gridSize ||
          newSnake
            .slice(1)
            .some((segment) => segment.x === head.x && segment.y === head.y)
        ) {
          submitScore(score);
          setGameOver(true);
          return prevSnake;
        }

        if (head.x === food.x && head.y === food.y) {
          setFood({
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
          });
          setScore((prev) => prev + 1);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setSnake(initialSnake);
    setFood(initialFood);
    setScore(0);
    setDirection("RIGHT");
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (input.trim() === "") return;

    const { data, error } = await supabase
      .from("comments")
      .insert([{ username: userName, text: input, game: gameIdentifier }])
      .select(); 

    if (error) {
      alert("Error posting comment: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      setComments((prev) => [...prev, data[0]]);
    }

    setInput(""); 
  };

  return (
    <div className="snake-game-wrapper">
      <div className="snake-game-container">
        {!gameStarted ? (
          <div className="snake-start-screen">
            <h1>Snake Game</h1>
            <button onClick={startGame} className="snake-start-btn">
              Start Game
            </button>
          </div>
        ) : gameOver ? (
          <div className="snake-game-over">
            <h1>Game Over</h1>
            <p>Score: {score}</p>
            <button onClick={startGame} className="snake-restart-btn">
              Restart
            </button>
          </div>
        ) : (
          <>
            <h2 className="snake-score">Score: {score}</h2>
            <div className="snake-grid">
              {[...Array(gridSize)].map((_, row) =>
                [...Array(gridSize)].map((_, col) => {
                  const isSnake = snake.some((s) => s.x === col && s.y === row);
                  const isFood = food.x === col && food.y === row;
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`snake-cell ${isSnake ? "snake-body" : ""} ${
                        isFood ? "snake-food" : ""
                      }`}
                    />
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <div className="snake-comment-section">
        <h3>Comments for Snake</h3>
        <ul className="snake-comments-list">
          {comments.map((c, i) => (
            <li key={i}>
              <strong>
                {c.username}{" "}
                <a className="snake-timestamp">
                  {new Date(c.created_at).toLocaleDateString()}
                </a>
                :
              </strong>{" "}
              {c.text}
            </li>
          ))}
        </ul>
        <form onSubmit={handleCommentSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Leave a comment..."
            className="snake-comment-input"
          />
          <button type="submit" className="snake-comment-button">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default Snake;
