import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabaseClient";
import Login from "../Login";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUsername] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (isLogin) => {
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Handle login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        navigate("/dashboard");
      } else {
        // Handle signup
        if (!userName) throw new Error("Username is required");
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: userName,
            },
          },
        });

        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-page ${isFlipped ? "flipped" : ""}`}>
      <div className="background-image"></div>
      <header>
        <h1>DENI'S ARCADE EMPIRE</h1>
      </header>
      
      <div className="flip-container">
        <div className="flipper">
          {/* Login Form */}
          <div className="front translucent-container">
            <h2>WELCOME</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAuth(true);
            }}>
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Loading..." : "LOGIN"}
                </button>
                <div className="or-container">
                  <hr />
                  <span>OR</span>
                  <hr />
                </div>
                <button type="button" onClick={() => setIsFlipped(!isFlipped)}>
                  SIGN UP
                </button>
              </div>
            </form>
          </div>

          {/* Signup Form */}
          <div className="back translucent-container">
            <h2>SIGN UP</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAuth(false);
            }}>
              <input
                type="text"
                placeholder="USERNAME"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Creating Account..." : "SIGN UP"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  BACK TO LOGIN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;