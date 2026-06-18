import Dashboard from "./Dashboard";
import { useState } from "react";
import "./App.css";
import axios from "axios";


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    if (isLogin) {

      const res = await axios.post(
        "http://localhost:8080/auth/login",
        {
          email,
          password
        }
      );

      if (typeof res.data === "string") {
        alert(res.data);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(res.data)
      );

      setLoggedIn(true);
      setUserName(res.data.name);

    } else {

      const res = await axios.post(
        "http://localhost:8080/auth/register",
        {
          name,
          email,
          password
        }
      );

      alert(res.data);
      setIsLogin(true);
    }

  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
};

  if (loggedIn) {
    return <Dashboard userName={userName} />;
  }

  return (
    <div className="login-container">

      <div className="login-card">

        <h1 className="app-title">💰 BudgetBuddy</h1>

        <p className="subtitle">
          Smart Student Budget Manager
        </p>

        <div className="toggle-buttons">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>

          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Register"}
          </button>

        </form>

        

      </div>

    </div>
  );
}

export default App;