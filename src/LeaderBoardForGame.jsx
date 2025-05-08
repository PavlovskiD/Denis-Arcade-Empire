import React, { useEffect, useState } from "react";
import supabase from "./supabase/supabaseClient";

const LeaderboardForGame = ({ gameId, limit = 10 }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("game_score")
      .select("score, user_id, users(email)") // Correct the join syntax and check your column name
      .eq("game_id", gameId)
      .order("score", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", error.message);
      setLeaderboard([]);  // Clear leaderboard on error
    } else {
      setLeaderboard(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [gameId]);  // Fetch leaderboard when the gameId changes

  return (
    <div className="leaderboard-container">
      <h2>Leaderboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : leaderboard.length > 0 ? (
        <ol>
          {leaderboard.map((entry) => (
            <li key={entry.user_id}>
              {entry.users?.email || "Unknown"} — {entry.score}
            </li>
          ))}
        </ol>
      ) : (
        <p>No scores yet!</p>
      )}
    </div>
  );
};

export default LeaderboardForGame;
