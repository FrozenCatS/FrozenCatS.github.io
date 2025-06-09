import React, { useState } from "react";
import AdminPanel from "./AdminPanel";
import MovieLeaderboard from "./MovieLeaderboard";
import { UserType } from "../App";

type Props = {
  user: UserType;
  onLogout: () => void;
};

export default function MainPage({ user, onLogout }: Props) {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div>
      <header style={{ background: "#060010", color: "#fff", padding: 16, display: "flex", justifyContent: "space-between" }}>
        <span>Logged in as <b>{user.username}</b> {user.isAdmin && <span style={{ color: "#39f" }}>[admin]</span>}</span>
        <span>
          {user.isAdmin && (
            <button
              onClick={() => setShowAdmin((v) => !v)}
              style={{ background: "#3399ff", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, marginRight: 12 }}
            >
              {showAdmin ? "Hide Admin Panel" : "Admin Panel"}
            </button>
          )}
          <button onClick={onLogout} style={{ background: "#ff6666", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700 }}>
            Logout
          </button>
        </span>
      </header>
      {showAdmin && user.isAdmin && <AdminPanel />}
      <MovieLeaderboard user={user} />
    </div>
  );
}