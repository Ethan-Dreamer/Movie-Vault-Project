import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import Result from "./components/Result";
import Watched from "./components/Watched";
import PopUp from "./components/PopUp";
import Header from "./components/Header";
import WatchedPage from "./components/WatchedPage";
import SignUpPage from "./components/SignUpPage";
import LoginPage from "./components/LoginPage";
import { Navigate } from "react-router-dom";

function App() {
  const [result, setResult] = useState(null);
  const [watched, setWatched] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoaded] = useState(false);

  const fetchWatched = async () => {
    try {
      const result = await fetch("http://localhost:3000/api/watched", {
        credentials: "include",
      });
      const data = await result.json();
      if (data.watched && data.watched.length > 0) {
        setWatched(data.watched || []);
      }
    } catch (error) {
      console.log("Error fetching watched movies: ", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const authRes = await fetch("http://localhost:3000/check-auth", {
        credentials: "include",
      });
      const authData = await authRes.json();
      if (authData.user) {
        await fetchWatched();
      }
    };
    init();
  }, []);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route
          path="/home"
          element={
            <>
              <Header />
              <SearchBar
                setResult={setResult}
                setOpen={setOpen}
                setLoaded={setLoaded}
              />
              <Watched
                watched={watched}
                fetchWatched={fetchWatched}
                setWatched={setWatched}
              />
              <PopUp isOpen={isOpen} onClose={() => setOpen(false)}>
                <Result
                  fetchWatched={fetchWatched}
                  result={result}
                  setWatched={setWatched}
                  watched={watched}
                  loading={loading}
                  setOpen={setOpen}
                />
              </PopUp>
            </>
          }
        />
        <Route
          path="/watched"
          element={
            <WatchedPage watched={watched} setWatched={setWatched} fetchWatched={fetchWatched} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
