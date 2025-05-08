import React, { useState, useEffect } from "react";
import supabase from "./supabase/supabaseClient";
import "./Settings.css"; // Import your CSS file

const Settings = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [activityStatus, setActivityStatus] = useState("visible");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUsername(user.user_metadata?.username || "");
          setEmail(user.email || "");
          setBio(user.user_metadata?.bio || "");
          setAvatarUrl(user.user_metadata?.avatarUrl || "");
        } else {
          setError("No user found. Please log in.");
        }
      } catch (error) {
        setError("Error fetching user data: " + error.message);
      }
    };

    fetchUserData();
  }, []);

  const updateProfile = async () => {
    try {
      // First, update the user's auth metadata
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { username, bio }
      });
  
      if (authError) throw authError;
  
      // Then, get current user info to update the leaderboard
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
  
      if (userError) throw userError;
  
      // Update the leaderboard table with the new username
      const { error: lbError } = await supabase
        .from("leaderboard")
        .update({ username })
        .eq("user_id", user.id);
  
      if (lbError) throw lbError;
  
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error updating profile: " + error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Update email
  const updateEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;
      setSuccess("Email updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error updating email: " + error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Update password
  const updatePassword = async () => {
    const newPassword = prompt("Enter your new password:");
    if (newPassword) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;
        setSuccess("Password updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError("Error updating password: " + error.message);
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  // Delete account
  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (confirmDelete) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(email);

        if (error) throw error;
        window.location.href = "/login"; // Redirect to login after account deletion
      } catch (error) {
        setError("Error deleting account: " + error.message);
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
  
      // Upload file with UUID to ensure unique filename
      const fileName = `${userData.user.id}-${Math.random().toString(36).substring(2, 15)}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
  
      if (uploadError) throw uploadError;
  
      // Get public URL with timestamp cache buster
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
  
      // Force refresh by adding timestamp
      const timestamp = new Date().getTime();
      const cachedUrl = `${urlData.publicUrl}?t=${timestamp}`;
  
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatarUrl: cachedUrl }
      });
  
      if (updateError) throw updateError;
  
      setAvatarUrl(cachedUrl);
      setSuccess("Profile picture updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error uploading avatar: " + error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="settings-page">
      <h1 className="header1">Settings</h1>

      {/* Error and Success Messages */}
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* User Profile Settings */}
      <div className="settings-card">
        <h2 className="header2">Profile Settings</h2>
        <div className="input-group">
          <label>Username</label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div className="input-group">
          <label>Bio</label>
          <textarea
            className="input"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>
        <button className="primary" onClick={updateProfile}>
          Update Profile
        </button>
        <label>Profile Picture</label>
          <div className="avatar-upload">
            {avatarUrl && (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="current-avatar"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="avatar-input"
            />
            <button 
              onClick={() => document.querySelector('.avatar-input').click()}
              className="secondary"
            >
              {avatarUrl ? "Change Avatar" : "Upload Avatar"}
            </button>
          </div>
        </div>
      

      {/* Account Settings */}
      <div className="settings-card">
        <h2 className="header2">Account Settings</h2>
        <div className="input-group">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <button className="primary" onClick={updateEmail}>
          Update Email
        </button>
        <button className="secondary" onClick={updatePassword}>
          Change Password
        </button>
        <button className="danger" onClick={deleteAccount}>
          Delete Account
        </button>
      </div>

      {/* Privacy Settings */}
      <div className="settings-card">
        <h2 className="header2">Privacy Settings</h2>
        <div className="input-group">
          <label>Profile Visibility</label>
          <select
            className="input"
            value={profileVisibility}
            onChange={(e) => setProfileVisibility(e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div className="input-group">
          <label>Activity Status</label>
          <select
            className="input"
            value={activityStatus}
            onChange={(e) => setActivityStatus(e.target.value)}
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Social Settings */}
      <div className="settings-card">
        <h2 className="header2">Social Settings</h2>
        <div className="input-group">
          <label>Friend Requests</label>
          <select className="input">
            <option value="allow">Allow All</option>
            <option value="restrict">Restrict</option>
          </select>
        </div>
        <div className="input-group">
          <label>Blocked Users</label>
          <button className="secondary">Manage Blocked Users</button>
        </div>
      </div>

      {/* Help and Support */}
      <div className="settings-card">
        <h2 className="header2">Help and Support</h2>
        <button className="secondary">FAQ</button>
        <button className="secondary">Contact Support</button>
        <button className="secondary">Report a Problem</button>
      </div>

      {/* Logout */}
      <div className="logout-card">
        <button
          id="logoutBtn"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
