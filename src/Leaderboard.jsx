import React, { useEffect, useState } from "react";
import supabase from "./supabase/supabaseClient";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
      } else {
        window.location.href = "/login";
      }
    };

    fetchUserData();
  }, []);

  // Fetch leaderboard after user is set
  useEffect(() => {
    if (!user) return;

    const fetchLeaderboard = async () => {
      try {
        // Check if user already in leaderboard
        const { data: existingUser, error: checkError } = await supabase
          .from("leaderboard")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(); // ✅ Prevents duplicate insert

        if (checkError) throw checkError;

        // Insert if user not found
        if (!existingUser) {
          const { error: insertError } = await supabase
            .from("leaderboard")
            .insert([
              {
                user_id: user.id,
                username: user.user_metadata?.username || "Unnamed",
                score: 0,
                games_played: 0,
              },
            ]);

          if (insertError) throw insertError;
        }

        // Fetch leaderboard
        const { data: leaderboard, error: fetchError } = await supabase
          .from("leaderboard")
          .select("*")
          .order("score", { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;

        setLeaderboardData(leaderboard);
      } catch (error) {
        setError("Error fetching leaderboard: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="leaderboard-page">
      <h1 className="headers">Leaderboard</h1>
      <div className="top-players">
        <h2 className="headers">Top Players</h2>
        <div className="top-three">
          {leaderboardData.slice(0, 3).map((player, index) => (
            <div key={player.id} className={`top-player rank-${index + 1}`}>
              <div className="rank">{index + 1}</div>
              <div className="username">{player.username}</div>
              <div className="score">{player.score} points</div>
            </div>
          ))}
        </div>
      </div>
      <div className="full-leaderboard">
        <h2 className="headers">Full Leaderboard</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              <th>Games Played</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player, index) => (
              <tr key={player.id}>
                <td>{index + 1}</td>
                <td>{player.username}</td>
                <td>{player.score}</td>
                <td>{player.games_played}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
