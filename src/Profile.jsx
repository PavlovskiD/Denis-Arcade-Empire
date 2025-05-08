import React from "react";
import "./Profile.css";
import { useEffect, useState } from "react";
import supabase from "./supabase/supabaseClient";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [userId, setUserId] = useState("");
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;
        if (user) {
          setUsername(user.user_metadata?.username || "");
          setEmail(user.email || "");
          setBio(user.user_metadata?.bio || "");
          setUserId(user.id);
          fetchGames();
          // fetchFavorites(user.id);
          // fetchRecentlyPlayed(user.id);
          setAvatarUrl(
            user.user_metadata?.avatarUrl
              ? `${user.user_metadata.avatarUrl}?updated=${Date.now()}`
              : "https://via.placeholder.com/100"
          );
        }
      } catch (error) {
        setError("Error fetching user data: " + error.message);
        setTimeout(() => setError(""), 3000);
      }
    };

    const fetchGames = async () => {
      const { data, error } = await supabase.from("games").select("*");
      
      if (error) {
        console.error("Error fetching games: ", error);
      } else {
        setGames(data);
      }
    };
    fetchUserData();
    
    // const fetchFavorites = async () => {
    //   try {
    //     const { data: { user }, error: authError } = await supabase.auth.getUser(); // Fetch the user correctly
    //     if (authError) throw new Error(authError.message);
    //     if (!user) throw new Error("User is not logged in");
    
    //     const { data: favoritesData, error: favoritesError } = await supabase
    //       .from("favorites")
    //       .select("game_id")
    //       .eq("user_id", user.id); // Fetch favorite game IDs correctly
    
    //     if (favoritesError) {
    //       console.error("Error fetching favorite game IDs:", favoritesError);
    //       setFavoriteGames([]);
    //       return;
    //     }
    
    //     if (favoritesData && favoritesData.length > 0) {
    //       const gameIds = favoritesData.map(fav => fav.game_id); // Extract valid game_ids
    
    //       const { data: gamesData, error: gamesError } = await supabase
    //         .from("games")
    //         .select("id, name, path")
    //         .in("id", gameIds); // Ensure game_ids are valid
    
    //       if (gamesError) {
    //         console.error("Error fetching game details:", gamesError);
    //         setFavoriteGames([]);
    //         return;
    //       }
    
    //       setFavoriteGames(gamesData || []);
    //     } else {
    //       setFavoriteGames([]);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching favorites:", error);
    //     setFavoriteGames([]);
    //   }
    // };

    // const fetchRecentlyPlayed = async (uid) => {
    //   const { data, error } = await supabase
    //     .from("recently_played")
    //     .select("game_id, games (name, path), played_at")
    //     .eq("user_id", uid)
    //     .order("played_at", { descending: true })
    //     .limit(5);

    //   if (error) {
    //     console.error("Error fetching recently played:", error);
    //   } else {
    //     setRecentGames(data.map((row) => row.games));
    //   }
    // };


    // Add real-time listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "USER_UPDATED") {
        fetchUserData();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <div className="profile-container">
      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Profile Header */}
      <div className="profile-header">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="profile-avatar"
          key={avatarUrl} // Force re-render when URL changes
        />
        <h2 className="profile-username">{username}</h2>
        <p className="profile-bio">{bio}</p>
      </div>

      {/* Favorite Games */}
      <div className="profile-section">
        <h3 className="h3">Favorite Games</h3>
        <ul>
          {Array.isArray(favoriteGames) && favoriteGames.length > 0 ? (
            favoriteGames.map((game, i) => (
              <li key={i}>
                <a href={game.path}>{game.name}</a>
              </li>
            ))
          ) : (
            <li>No favorites yet.</li>
          )}
        </ul>
      </div>

      {/* Recently Played Games */}
      <div className="profile-section">
        <h3 className="h3">Recently Played</h3>
        <ul>
          {recentGames.length > 0 ? (
            recentGames.map((game, i) => (
              <li key={i}>
                <a href={game.path}>{game.name}</a>
              </li>
            ))
          ) : (
            <li>No recent games yet.</li>
          )}
        </ul>
      </div>

      {/* Friends List */}
      <div className="profile-section">
        <h3 className="h3">Friends</h3>
        <ul>
          {["User123", "GamerX", "ShadowKnight"].map((friend, index) => (
            <li key={index}>{friend}</li>
          ))}
        </ul>
      </div>

      {/* Achievements */}
      <div className="profile-section">
        <h3 className="h3">Achievements</h3>
        <ul>
          {["Top 10% Player", "Played 100 Games", "Daily Streak: 7 days"].map(
            (achievement, index) => (
              <li key={index}>{achievement}</li>
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
