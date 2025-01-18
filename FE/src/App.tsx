import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./components/Home";
import Join from "./components/Join";
import { useState } from "react";

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [id, setId] = useState<string>("");
  const isLoggedIn = localStorage.getItem("loggedIn");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Home ws={ws} id={id} />
            ) : (
              <Join setWs={setWs} setId={setId} />
            )
          }
        />
        <Route
          path="home"
          element={
            isLoggedIn ? (
              <Home ws={ws} id={id} />
            ) : (
              <Join setWs={setWs} setId={setId} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
