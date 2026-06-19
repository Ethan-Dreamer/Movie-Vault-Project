import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import CircularProgress from "@mui/material/CircularProgress";
import PopUp from "./PopUp";
import RadioGroupRating, { customIcons } from "./RadioGroupRating";

function Result({ result, watched, loading, setOpen, fetchWatched }) {
  const [isAdded, setAdded] = useState(false);
  const [isOpen, setOpenSuggestion] = useState(false);
  const [rating, setRating] = useState(3);
  const url = "http://localhost:3000";

  const resultTitle = result?.title || result?.original_name;

  useEffect(() => {
    if (
      result &&
      watched.some((item) => {
        const movieTitle = item.movie_title;
        return movieTitle === resultTitle;
      })
    ) {
      setAdded(true);
    } else {
      setAdded(false);
    }
  }, [result, watched, resultTitle]);

  const addRating = async () => {
    // setWatched((prev) =>
    //   prev.map((item) => {
    //     const movieTitle = item.movie?.title || item.movie?.original_name;
    //     if (movieTitle === resultTitle) {
    //       return { ...item, experience: rating };
    //     }
    //     return item;
    //   })
    // );
    try {
      const res = await fetch("http://localhost:3000/api/watched/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: resultTitle, value: rating }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        console.log("Failed to update rating:", err.error || res.statusText);
        return;
      }

      console.log("Rating updated successfully!");
      fetchWatched();
      setOpen(false);
      setOpenSuggestion(false);
    } catch (error) {
      console.log("Error editing rating from watched!");
    }
  };

  const addToWatched = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${url}/api/watched/search?title=${encodeURIComponent(resultTitle)}`,
      {
        credentials: "include",
      }
    );
    const data = await response.json();
    const exist = data.exist;



    if (!exist) {
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

    // setWatched((prev) => {

    //   if (exist) return prev;

    //   console.log(result);

    //   const newWatched = {
    //     movie: result,
    //     dateOfWatch: new Date().toISOString().split("T")[0],
    //     experience: "",
    //   };

    //   return [...prev, newWatched];

    // });

    await fetchWatched();
    setAdded(true);
    setOpenSuggestion(true);
  };

  if (!loading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!result) return <p>No Result Found!</p>;

  return (
    <div>
      <img
        src={`https://image.tmdb.org/t/p/w500${result.backdrop_path}`}
        alt={resultTitle}
        width="100%"
        style={{ margin: "10px 0" }}
      />
      <h1>{resultTitle}</h1>

      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
        <p style={{ textAlign: "justify" }}>{result.overview}</p>

        <div style={{ marginTop: "10px" }}>
          <Rating value={result.vote_average / 2} precision={0.1} readOnly />
        </div>
        <p style={{ marginTop: "10px" }}>Vote Count: {result.vote_count}</p>
      </div>

      <Button
        onClick={addToWatched}
        variant="contained"
        color="success"
        sx={{ borderRadius: "20px", marginTop: 1 }}
        disabled={isAdded}
      >
        {isAdded ? "Added to watched" : "Add to watched"}
      </Button>
      <PopUp isOpen={isOpen} onClose={() => setOpenSuggestion(false)}>
        <div>
          <h2>How would u like to rate this?</h2>
          <div style={{ marginTop: "15px", marginBottom: "10px" }}>
            <RadioGroupRating
              value={rating}
              onChange={(value) => {
                setRating(value);
                console.log("User picked:", value, customIcons[value].label);
              }}
            />
          </div>
          <Button
            sx={{ borderRadius: "20px", marginTop: 1 }}
            onClick={addRating}
            variant="contained"
            color="success"
          >
            Submit
          </Button>
        </div>
      </PopUp>
    </div>
  );
}

export default Result;
