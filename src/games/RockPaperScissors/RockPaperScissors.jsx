import React, { useEffect, useState } from "react";
import "./RockPaperScissors.css";
import rock from "./rock.png";
import paper from "./paper.png";
import scissors from "./scissors.png";
import submitScore from "../../SubmitScore";
import supabase from "../../supabase/supabaseClient";

const choices = [
  { name: "rock", image: rock },
  { name: "paper", image: paper },
  { name: "scissors", image: scissors },
];

const getRandomChoice = () => {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
};

const determineWinner = (playerChoice, computerChoice) => {
  if (playerChoice.name === computerChoice.name) {
    return "Draw";
  } else if (
    (playerChoice.name === "rock" && computerChoice.name === "scissors") ||
    (playerChoice.name === "paper" && computerChoice.name === "rock") ||
    (playerChoice.name === "scissors" && computerChoice.name === "paper")
  ) {
    return "Player";
  } else {
    return "Computer";
  }
};

const RockPaperScissors = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [roundResult, setRoundResult] = useState("");
  const [userName, setUserName] = useState("");
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const gameIdentifier = "rockpaperscissors";

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
        console.error("Error fetching commnets:", error);
      }
    };
    fetchComments();
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
    setPlayerScore(0);
    setComputerScore(0);
    setPlayerChoice(null);
    setComputerChoice(null);
    setRoundResult("");
  };

  const handleEndGame = () => {
    submitScore(playerScore);
    setGameStarted(false);
  };

  const handlePlayerChoice = (choice) => {
    if (!gameStarted) return;
    setPlayerChoice(choice);
    const compChoice = getRandomChoice();
    setComputerChoice(compChoice);
    const result = determineWinner(choice, compChoice);
    setRoundResult(result);
    if (result === "Player") setPlayerScore((prev) => prev + 1);
    else if (result === "Computer") setComputerScore((prev) => prev + 1);
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
    <div className="containerRPS">
      <div className="wrapperRPS">
        <h1 className="hdr">Rock Paper Scissors</h1>
        {!gameStarted ? (
          <button onClick={handleStartGame} className="start-buttonRPS">
            Start Game
          </button>
        ) : (
          <>
            <div className="scoreboardRPS">
              <div>
                {userName}: {playerScore}
              </div>
              <div>Computer: {computerScore}</div>
            </div>
            <div className="choicesRPS">
              {choices.map((choice, index) => (
                <img
                  key={index}
                  src={choice.image}
                  alt={choice.name}
                  className="choice-image"
                  onClick={() => handlePlayerChoice(choice)}
                />
              ))}
            </div>
            {playerChoice && computerChoice && (
              <div className="resultsRPS">
                <div>
                  <h2>Your Selection</h2>
                  <img
                    src={playerChoice.image}
                    alt={playerChoice.name}
                    className="result-imageRPS"
                  />
                  <p className="choice1">{playerChoice.name}</p>
                </div>
                <div>
                  <h2>Computer's Selection</h2>
                  <img
                    src={computerChoice.image}
                    alt={computerChoice.name}
                    className="result-imageRPS"
                  />
                  <p className="choice1">{computerChoice.name}</p>
                </div>
              </div>
            )}
            {roundResult && (
              <div className="round-resultRPS">
                <h2>
                  {roundResult === "Draw"
                    ? "It's a Draw!"
                    : `${roundResult} wins the round!`}
                </h2>
              </div>
            )}
            <button onClick={handleEndGame} className="end-buttonRPS">
              End Game
            </button>
          </>
        )}
      </div>
      <div className="RPS-comment-section">
        <h3>Comments for Rock Paper Scissors</h3>
        <ul className="RPS-comments-list">
          {comments.map((c, i) => (
            <li key={i}>
              <strong>
                {c.username}{" "}
                <a className="rps-timestamp">
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
            className="RPS-comment-input"
          />
          <button type="submit" className="RPS-comment-button">
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default RockPaperScissors;
