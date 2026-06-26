import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MyCard from "./MyCard";
import { API_URL } from "../config";

function SearchBar({ setResult, setOpen, setLoaded }) {
  const [suggestions, setSuggestions] = useState([]);
  const [movie, setMovie] = useState("");
  const url = `${API_URL}`;
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
        credentials: "include",
      });
      const data = await response.json();
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

    setLoaded(true);
    setOpen(true);
    setSuggestions([]);

    try {
      const response = await fetch(`${url}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ movie }),
      });
      const data = await response.json();
      setResult(data.movieDetails[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoaded(false);
    }
  };

  return (
    <Box className="search-container" ref={containerRef}>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          value={movie}
          onChange={handleChange}
          placeholder="Enter movie name"
          variant="outlined"
          autoComplete="off"
          sx={styles.textField}
        />
        <Button
          type="submit"
          variant="contained"
          color="error"
          sx={styles.searchButton}
        >
          Search
        </Button>
      </Box>

      {suggestions.length > 0 && (
        <Box className="suggestions">
          {suggestions.map((item) => (
            <MyCard
              key={item.id}
              movie={item}
              suggestion={true}
              onClick={() => {
                setLoaded(true);
                setOpen(true);
                setResult(item);
                setLoaded(false);
                setSuggestions([]);
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

const styles = {
  textField: {
    flex: 1,
    marginLeft: { xs: 1, md: 6 },
    backgroundColor: "white",
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "gray" },
      "&:hover fieldset": { borderColor: "black" },
      "&.Mui-focused fieldset": { borderColor: "rgb(195, 5, 5)" },
    },
  },
  searchButton: {
    marginRight: { xs: 1, md: 6 },
  },
};

export default SearchBar;