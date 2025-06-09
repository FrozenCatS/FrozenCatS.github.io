import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import MainPage from "./components/MainPage";

export type UserType = {
  id: string;
  username: string;
  isAdmin: boolean;
};

function App() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  function handleLogin(userObj: UserType) {
    setUser(userObj);
    localStorage.setItem("user", JSON.stringify(userObj));
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <div>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <MainPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;