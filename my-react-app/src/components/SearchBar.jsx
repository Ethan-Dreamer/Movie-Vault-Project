import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MyCard from "./Card";

function SearchBar({ setResult, setOpen, setLoaded }) {
  const [suggestions, setSuggestions] = useState([]);
  const [movie, setMovie] = useState("");
  const url = "http://localhost:3000";
  const timeoutRef = useRef(null);
  const containerRef = useRef(null); 
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchMovie = async (movieName) => {
    if (movieName.trim() === "") {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${url}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie: movieName }),
        credentials:"include"
      });
      const data = await response.json();
      console.log(data.movieDetails[0]);
      setSuggestions(data.movieDetails.slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMovie(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      searchMovie(value);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movie.trim()) return;
    setLoaded(false);
    setOpen(true);
    const response = await fetch(`${url}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials:"include",
      body: JSON.stringify({ movie }),
    });
    const data = await response.json();
    setResult(data.movieDetails[0]);
    setLoaded(true);
  };

  return (
    <div className="search-container" ref={containerRef}>
      <form onSubmit={handleSubmit}>
        <TextField
          value={movie}
          onChange={handleChange}
          placeholder="Enter movie name"
          variant="outlined"
          style={{ flex: 1 }}
          autoComplete="off"
          sx={{
            marginLeft: { xs: 1, md: 6 },
            backgroundColor: "white",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "black" },
              "&.Mui-focused fieldset": { borderColor: "rgb(195, 5, 5)" },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="error"
          sx={{ marginRight: { xs: 1, md: 6 } }}
        >
          Search
        </Button>
      </form>

      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((movie) => (
            <MyCard

              className="suggestion-card"
              key={movie.id}
              movie={movie}
              suggestion={true}
              onClick={() => {
                setLoaded(false);
                setOpen(true);
                setResult(movie);
                setLoaded(true);
                setSuggestions([]);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
