import React, { useState, useEffect } from "react";
import { Button, Rating, CircularProgress, Box } from "@mui/material";
import PopUp from "./PopUp";
import RadioGroupRating from "./RadioGroupRating";
import { API_URL } from "../config";

function Result({ result, watched, loading, setOpen, fetchWatched }) {
  const [isAdded, setAdded] = useState(false);
  const [isSuggestionOpen, setSuggestionOpen] = useState(false);
  const [rating, setRating] = useState(3);
  const url = `${API_URL}`;

  const resultTitle = result?.title || result?.original_name;

  useEffect(() => {
    if (!result) return;
    
    const alreadyWatched = watched.some(
      (item) => item.movie_title === resultTitle
    );
    setAdded(alreadyWatched);
  }, [result, watched, resultTitle]);

  const addRating = async () => {
    try {
      const res = await fetch(`${url}/api/watched/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: resultTitle, value: rating }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to update rating:", err.error || res.statusText);
        return;
      }

      await fetchWatched();
      setOpen(false);
      setSuggestionOpen(false);
    } catch (error) {
      console.error("Error editing rating from watched!", error);
    }
  };

  const addToWatched = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${url}/api/watched/search?title=${encodeURIComponent(resultTitle)}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (!data.exist) {
        await fetch(`${url}/api/watched`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            movie: result,
            dateOfWatch: new Date().toISOString().split("T")[0],
            experience: null,
          }),
        });
      }

      await fetchWatched();
      setAdded(true);
      setSuggestionOpen(true);
    } catch (error) {
      console.error("Error adding to watched:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={styles.loaderContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (!result) return <Box component="p">No Result Found!</Box>;

  return (
    <Box>
      <Box
        component="img"
        src={`https://image.tmdb.org/t/p/w500${result.backdrop_path}`}
        alt={resultTitle}
        sx={styles.backdropImage}
      />
      <Box component="h1">{resultTitle}</Box>

      <Box sx={styles.detailsContainer}>
        <Box component="p" sx={styles.overviewText}>
          {result.overview}
        </Box>

        <Box sx={styles.ratingWrapper}>
          <Rating value={result.vote_average / 2} precision={0.1} readOnly />
        </Box>
        <Box component="p" sx={styles.voteCountText}>
          Vote Count: {result.vote_count}
        </Box>
      </Box>

      <Button
        onClick={addToWatched}
        variant="contained"
        color="success"
        sx={styles.actionButton}
        disabled={isAdded}
      >
        {isAdded ? "Added to watched" : "Add to watched"}
      </Button>

      <PopUp isOpen={isSuggestionOpen} onClose={() => setSuggestionOpen(false)}>
        <Box>
          <Box component="h2">How would u like to rate this?</Box>
          <Box sx={styles.radioWrapper}>
            <RadioGroupRating
              value={rating}
              onChange={(value) => setRating(value)}
            />
          </Box>
          <Button
            sx={styles.actionButton}
            onClick={addRating}
            variant="contained"
            color="success"
          >
            Submit
          </Button>
        </Box>
      </PopUp>
    </Box>
  );
}

const styles = {
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  },
  backdropImage: {
    width: "100%",
    margin: "10px 0",
  },
  detailsContainer: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  overviewText: {
    textAlign: "justify",
  },
  ratingWrapper: {
    marginTop: "10px",
  },
  voteCountText: {
    marginTop: "10px",
  },
  actionButton: {
    borderRadius: "20px",
    marginTop: 1,
  },
  radioWrapper: {
    marginTop: "15px",
    marginBottom: "10px",
  },
};

export default Result;