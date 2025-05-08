import React, { useEffect, useState } from "react";
import "./Dashboard1.css";
import leftStone from "./assets/noBackStone.svg";
import rightStone from "./assets/noBackStone.svg";
import { Link } from "react-router-dom";
import supabase from "./supabase/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faSearch } from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const initialScale = 0.8;
  const scaleFactor = 0.002;

  const games = [
    { id: 1, name: "Flappy Bird", path: "/Flappy-Bird" },
    { id: 2, name: "Tic-Tac-Toe", path: "/Tic-Tac-Toe" },
    { id: 3, name: "Snake Game", path: "/Snake" },
    { id: 4, name: "Doodle-Jump", path: "/Doodle-Jump" },
    { id: 5, name: "Memory Game", path: "/Memory-Game" },
    { id: 6, name: "Space Invaders", path: "/Space-Invaders" },
    { id: 7, name: "Pong", path: "/Pong" },
    { id: 8, name: "Rock-Paper-Scissors", path: "/Rock-Paper-Scissors" },
    { id: 9, name: "Whack-A-Mole", path: "/Whack-A-Mole" },
  ];

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  useEffect(() => {
    document.body.classList.add("background-dashboard");
    return () => {
      document.body.classList.remove("background-dashboard");
    };
  }, []);

  useEffect(() => {
    // Fetch user data from Supabase
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get username from user metadata (stored during signup)
        setUserId(user.id);
        setUserName(user.user_metadata?.username || "User");
        setUserEmail(user.email || "");
      } else {
        // If no user found, redirect to login
        window.location.href = "/login";
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scale = initialScale + scrollPosition * scaleFactor;
  const contentVisibility = scale > 1.4 ? 1 : 0;

  // const handleAddFavorite = async (game) => {
  //   try {
  //     const { data: { user }, error: authError } = await supabase.auth.getUser(); // Use getUser instead
  //     if (authError) throw new Error(authError.message);
  //     if (!user) throw new Error("User is not logged in");
  
  //     const { error } = await supabase.from("favorites").insert([
  //       {
  //         user_id: user.id, // Ensure you're passing the correct user id
  //         game_id: game.id,  // Ensure you're passing the correct game id
  //       },
  //     ]);
  
  //     if (error) {
  //       console.error("Error adding to favorites:", error);
  //       alert("Error adding to favorites");
  //     } else {
  //       alert("Added to favorites!");
  //     }
  //   } catch (error) {
  //     console.error("Error adding to favorites:", error);
  //     alert("Error adding to favorites");
  //   }
  // };
  
  

  return (
    <>
      <div className="dashboard-page">
        <div
          className="header"
          style={{
            zIndex: 3,
            opacity: scale > 1.2 ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        >
          Welcome {userName} {/* Display username from state */}
        </div>
        <img
          className="stone-left"
          src={leftStone}
          alt="Left Stone"
          style={{
            transform: `scale(${scale})`,
            position: "fixed",
            left: "1%",
            top: "1%",
            transformOrigin: "bottom center",
            transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
            opacity: scale > 1.4 ? 0 : 1,
            zIndex: 2,
          }}
        />
        <img
          className="stone-right"
          src={rightStone}
          alt="Right Stone"
          style={{
            transform: `scale(${scale}) scaleX(-1)`,
            position: "fixed",
            right: "1%",
            top: "1%",
            transformOrigin: "bottom center",
            transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
            opacity: scale > 1.4 ? 0 : 1,
            zIndex: 2,
          }}
        />
      </div>
      <div
        className="extended-content"
        style={{
          opacity: contentVisibility,
          transition: "opacity 0.5s ease-out, visibility 0.5s ease-out",
          visibility: contentVisibility ? "visible" : "hidden",
          zIndex: 1,
        }}
      >
        <div className="nav-bar">
          <h1>Deni's Arcade Empire</h1>
          <ul>
            <li>
              <Link to="/profile" className="nav-links">
                Profile
              </Link>
            </li>
            {/* <li>
              <Link to="" className="nav-links">
                Store
              </Link>
            </li> */}
            <li>
              <Link to="/leaderboard" className="nav-links">
                Leaderboard
              </Link>
            </li>
            {/* <li>
              <Link to="" className="nav-links">
                Friends
              </Link>
            </li> */}
            <li>
              <Link to="/settings" className="nav-links">
                Settings
              </Link>
            </li>
          </ul>
          <div className="search-bar-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              id="search-bar"
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
        <div className="games">
          {filteredGames.map((game) => (
            <div key={game.id} className="game-card">
            <Link className="linkDash" to={game.path}>
              <h3 className="game-name">{game.name}</h3>
            </Link>
            {/* <button className="favorite-btn" onClick={() => handleAddFavorite(game.id)}>
              <FontAwesomeIcon icon={faHeart} /> Favorites
            </button> */}
            </div>
          ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
