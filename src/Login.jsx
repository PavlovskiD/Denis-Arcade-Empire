import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "./supabase/supabaseClient";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUsername] = useState("");
  const [isFlipped, setIsFlipped] = useState(false); // State to track flip
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("background-login");
    return () => {
      document.body.classList.remove("background-login");
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
 
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      console.log("User logged in:", data.user);

     
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username: data.user.user_metadata?.username,
          email: email,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error.message);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (!userName) {
      alert("Please provide a username.");
      return;
    }

    try {
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: userName, 
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      console.log("User signed up:", data.user);

     
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ username: userName, email: email })
      );

      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset your password.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/update-password",
      });
      if (error) {
        alert(error.message);
      } else {
        alert("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      console.error("Error sending password reset email:", err.message);
    }
  };

  return (
    <div className={`login-page ${isFlipped ? "flipped" : ""}`}>
      <div className="background-image"></div>
      <header>
        <h1 className="heading">DENI'S ARCADE EMPIRE</h1>
      </header>
      <div className="flip-container">
        <div className="flipper">
          {/* Login Form */}
          <div className="front translucent-container">
            <h2>WELCOME</h2>
            <form onSubmit={handleSubmit}>
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
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                FORGOT PASSWORD? CLICK HERE
              </button>
              <div className="buttons">
                <button className="btn1-2" type="submit">
                  LOGIN
                </button>
                <div className="or-container">
                  <hr />
                  <span>OR</span>
                  <hr />
                </div>
                <button className="btn1-2" type="button" onClick={handleFlip}>
                  SIGN UP
                </button>
              </div>
            </form>
          </div>

          {/* Signup Form */}
          <div className="back translucent-container">
            <h2>SIGN UP</h2>
            <form onSubmit={handleSignup}>
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
                <button className="btn1-2" type="submit">
                  SIGN UP
                </button>
                <button className="btn1-2" type="button" onClick={handleFlip}>
                  BACK TO LOGIN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
