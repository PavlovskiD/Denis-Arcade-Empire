import supabase from "./supabase/supabaseClient";

const submitScore = async (score) => {
  if (score <= 0) return;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("User not logged in:", userError);
    return;
  }

  const { id: userId, email: username } = user;

  const { data: existingUser, error: fetchError } = await supabase
    .from("leaderboard")
    .select("score, games_played")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching user data:", fetchError);
    return;
  }

  if (existingUser) {
    const { error: updateError } = await supabase
      .from("leaderboard")
      .update({
        score: existingUser.score + score,
        games_played: existingUser.games_played + 1,
        last_updated: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating score:", updateError);
    } else {
      console.log("Score updated successfully!");
    }
  } else {
    const { error: insertError } = await supabase.from("leaderboard").insert([
      {
        user_id: userId,
        username: username,
        score: score,
        games_played: 1,
        last_updated: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Error inserting score:", insertError);
    } else {
      console.log("New score submitted successfully!");
    }
  }
};

export default submitScore;
