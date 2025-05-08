import React, { useEffect, useRef, useState } from "react";
import doodlerRight from "./doodler-right.png";
import doodlerLeft from "./doodler-left.png";
import platformImg from "./platform.png";
import "./DoodleJump.css";
import supabase from "../../supabase/supabaseClient";

const DoodleJump = () => {
  const boardRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  // Comment section states
  const [userName, setUserName] = useState("");
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const gameIdentifier = "doodlejump";

  const boardWidth = 400;
  const boardHeight = 600;
  const platformWidth = 60;
  const platformHeight = 18;
  const initialVelocityY = -10;
  const gravity = 0.4;
  let velocityX = 0;
  let velocityY = initialVelocityY;

  let doodler = {
    img: new Image(),
    x: boardWidth / 2 - 20,
    y: boardHeight / 2,
    width: 40,
    height: 40,
  };

  let platformArray = [];

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
        .eq("game", gameIdentifier) // Filter comments by game identifier
        .order("created_at", { ascending: true });

      if (!error) {
        setComments(data); // Store only comments for this game
      } else {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const board = boardRef.current;
    const ctx = board.getContext("2d");

    doodler.img.src = doodlerRight;
    placePlatforms();

    const updateGame = () => {
      if (gameOver) return;
      ctx.clearRect(0, 0, board.width, board.height);

      // Doodler Movement
      doodler.x += velocityX;
      if (doodler.x > boardWidth) doodler.x = 0;
      else if (doodler.x + doodler.width < 0) doodler.x = boardWidth;

      velocityY += gravity;
      doodler.y += velocityY;

      if (doodler.y > board.height) {
        setGameOver(true);
        return;
      }

      ctx.drawImage(
        doodler.img,
        doodler.x,
        doodler.y,
        doodler.width,
        doodler.height
      );

      // Platforms
      platformArray.forEach((platform) => {
        if (velocityY < 0 && doodler.y < boardHeight * 0.75) {
          platform.y -= initialVelocityY;
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
          velocityY = initialVelocityY;
        }
        ctx.drawImage(
          platform.img,
          platform.x,
          platform.y,
          platform.width,
          platform.height
        );
      });

      // Remove old platforms and add new ones
      while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform();
      }

      // Score Update
      updateScore();

      ctx.fillStyle = "black";
      ctx.font = "16px sans-serif";
      ctx.fillText(score, 5, 20);

      if (gameOver) {
        ctx.fillText(
          "Game Over: Press 'Restart'",
          boardWidth / 4,
          (boardHeight * 7) / 8
        );
      }

      requestAnimationFrame(updateGame);
    };

    document.addEventListener("keydown", moveDoodler);
    updateGame();

    return () => {
      document.removeEventListener("keydown", moveDoodler);
    };
  }, [gameOver, gameStarted]);

  const moveDoodler = (e) => {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
      velocityX = 4;
      doodler.img.src = doodlerRight;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
      velocityX = -4;
      doodler.img.src = doodlerLeft;
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    restartGame();
  };

  const restartGame = () => {
    doodler = {
      img: new Image(),
      x: boardWidth / 2 - 20,
      y: boardHeight / 2,
      width: 40,
      height: 40,
    };
    doodler.img.src = doodlerRight;
    velocityX = 0;
    velocityY = initialVelocityY;
    setScore(0);
    setMaxScore(0);
    setGameOver(false);
    placePlatforms();
  };

  const placePlatforms = () => {
    platformArray = [];
    let firstPlatform = {
      img: new Image(),
      x: boardWidth / 2,
      y: boardHeight - 50,
      width: platformWidth,
      height: platformHeight,
    };
    firstPlatform.img.src = platformImg;
    platformArray.push(firstPlatform);

    for (let i = 0; i < 6; i++) {
      let randomX = Math.floor((Math.random() * (boardWidth * 3)) / 4);
      let platform = {
        img: new Image(),
        x: randomX,
        y: boardHeight - 75 * i - 150,
        width: platformWidth,
        height: platformHeight,
      };
      platform.img.src = platformImg;
      platformArray.push(platform);
    }
  };

  const newPlatform = () => {
    let randomX = Math.floor((Math.random() * (boardWidth * 3)) / 4);
    let platform = {
      img: new Image(),
      x: randomX,
      y: -platformHeight,
      width: platformWidth,
      height: platformHeight,
    };
    platform.img.src = platformImg;
    platformArray.push(platform);
  };

  const detectCollision = (a, b) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  let updateScore = () => {
    if (velocityY < 0) {
      setMaxScore((prev) => prev + 10);
      setScore((prev) => Math.max(prev, maxScore));
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (input.trim() === "") return;

    const { data, error } = await supabase
      .from("comments")
      .insert([{ username: userName, text: input, game: gameIdentifier }])
      .select(); // 👈 make sure to include .select() to get the inserted row back

    if (error) {
      alert("Error posting comment: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      setComments((prev) => [...prev, data[0]]);
    }

    setInput(""); // Clear the input field
  };

  return (
    <div className="doodle-game-wrapper">
      <div className="doodle-container">
        <canvas
          id="board"
          ref={boardRef}
          width={boardWidth}
          height={boardHeight}
        ></canvas>
        {!gameStarted ? (
          <button className="start" onClick={startGame}>
            Start
          </button>
        ) : gameOver ? (
          <button className="restart" onClick={startGame}>
            Restart
          </button>
        ) : null}
      </div>
      <div className="doodle-comment-section">
        <h3>Comments for Doodle Jump</h3>
        <ul className="doodle-comments-list">
          {comments.map((c, i) => (
            <li key={i}>
              <strong>
                {c.username}{" "}
                <a className="doodle-timestamp">
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
            className="doodle-comment-input"
          />
          <button type="submit" className="doodle-comment-button">
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoodleJump;
