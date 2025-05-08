// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Settings from "./Settings";
import Leaderboard from "./Leaderboard";
import ScrollToTop from "./ScrollToTop";
import FlappyBird from "./games/FlappyBird";
import TicTacToe from "./games/TicTacToe/TicTacToe";
import SnakeGame from "./games/Snake/Snake";
import DoodleJump from "./games/DoodleJump/DoodleJump";
import MemoryGame from "./games/MemoryGame/MemoryGame";
import SpaceInvaders from "./games/SpaceInvaders/SpaceInvaders";
import PongGame from "./games/Pong/PongGame";
import RockPaperScissors from "./games/RockPaperScissors/RockPaperScissors";
import WhackAMole from "./games/WhackAMole/WhackAMole";

function App() {
  return (
    <Router>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/Flappy-Bird" element={<FlappyBird />} />
        <Route path="/Tic-Tac-Toe" element={<TicTacToe />} />
        <Route path="/Snake"  element={<SnakeGame />} />
        <Route path="/Doodle-Jump" element={<DoodleJump />} />
        <Route path="/Memory-Game" element={<MemoryGame />} />
        <Route path="/Space-Invaders" element={<SpaceInvaders />} />
        <Route path="/Pong" element={<PongGame />} />
        <Route path="/Rock-Paper-Scissors" element={<RockPaperScissors />} />
        <Route path="/Whack-A-Mole" element={<WhackAMole />} />
      </Routes>
    </Router>
  );
}

export default App;
