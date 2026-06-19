import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import { customIcons } from "./RadioGroupRating";
import PopUp from "./PopUp";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMediaQuery } from "@mui/material";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import RadioGroupRating from "./RadioGroupRating";

function MyCard({
  movie,
  setWatched,
  id,
  suggestion,
  watched,
  onClick,
  experience,
  dateOfWatch,
  fetchWatched,
}) {
  const [deletePopUp, setPopUp] = useState(false);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [rating, setRating] = useState(experience || 3);
  const [isOpen, setOpen] = useState(false);

  const deleteMovie = async () => {
    const title = movie.movie_title;
    try {
      const res = await fetch("http://localhost:3000/api/watched/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        // setWatched((prev) => prev.filter((m) => m.movie_title !== title));
        setWatched([]);
        await fetchWatched();
        console.log("Deleted movie:", title);
        setPopUp(false);
      } else {
        console.log("Error deleting movie:", data.error);
      }
    } catch (error) {
      console.log("Error deleting movie:", error);
    }
  };

  const overviewText = movie.movie_overview
    ? isMobile
      ? movie.movie_overview.slice(0, 70) +
        (movie.movie_overview.length > 70 ? "..." : "")
      : movie.movie_overview.slice(0, 150) +
        (movie.movie_overview.length > 150 ? "..." : "")
    : "";

  return (
    <div
      className={`card ${suggestion ? "clickable" : ""}`}
      style={{ cursor: suggestion ? "pointer" : "default" }}
      onClick={suggestion ? onClick : null}
    >
      <div className="card-details">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <h2
            className="card-title"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {suggestion
              ? `${movie.title || movie.original_name}`
              : `${id}. ${movie.movie_title}`}
            {!suggestion && (
              <DeleteIcon
                onClick={() => setPopUp(true)}
                htmlColor="#c30505"
                sx={{ cursor: "pointer", fontSize: { xs: "16px", sm: "24px" } }}
              />
            )}
          </h2>
          {suggestion && (
            <Rating
              value={movie.vote_average / 2}
              precision={0.5}
              readOnly
              size="small"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            />
          )}
          {suggestion && (
            <span
              style={{
                fontSize: "14px",
                color: "#555",
                transform: "translateY(1px)",
                display: isMobile ? "none" : "inline",
              }}
            >
              {(movie.vote_average / 2).toFixed(1)}
            </span>
          )}
        </div>

        {suggestion && (
          <div
            className="text-on-mobile"
            style={{ color: "#555", marginTop: "10px" }}
          >
            <p>{`Release Date: ${
              movie.release_date || movie.first_air_date
            }`}</p>
            <p>{`Total Votes: ${movie.vote_count}`}</p>
          </div>
        )}

        {!suggestion && (
          <div className="card-description">
            <p>{overviewText}</p>
            <p style={{ margin: "10px 0 10px 0" }}>
              <span style={{ fontWeight: "bold" }}>Set to watched on: </span>
              {new Date(dateOfWatch).toLocaleDateString()}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: "bold" }}>Experience:</span>
              {customIcons[experience]?.icon || <span>Not rated!</span>}
              <Button
                onClick={() => {
                  setOpen(true);
                }}
                variant="contained"
                color="success"
                sx={{
                  height: "20px",
                  minWidth: "30px",
                  padding: "0 6px",
                  fontSize: "0.7rem",
                  lineHeight: 1,
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </div>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_url || movie.poster_path}`}
        alt={movie.poster_url || movie.poster_path}
        style={
          suggestion
            ? { maxHeight: "120px" }
            : { maxHeight: isMobile ? "160px" : "190px" }
        }
      />
      <PopUp
        removeClose={true}
        isOpen={deletePopUp}
        onClose={() => setPopUp(false)}
      >
        <div className="delete-popup">
          <p>
            Are you sure you want to remove{" "}
            <span style={{ fontWeight: "bold", color: "#c30505" }}>
              {movie.movie_title}
            </span>
            ?
          </p>
          <img
            className="delete-popup-img"
            src={`https://image.tmdb.org/t/p/w500${movie.poster_url}`}
            alt={movie.poster_url}
          />
          <div>
            <Button
              onClick={deleteMovie}
              variant="outlined"
              color="error"
              size="small"
              sx={{ marginRight: 1 }}
              startIcon={<DeleteIcon />}
            >
              Remove
            </Button>
            <Button
              onClick={() => setPopUp(false)}
              variant="contained"
              color="white"
              size="small"
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopUp>
      <PopUp isOpen={isOpen} onClose={() => setOpen(false)}>
        <div>
          <h2>How would u like to rate this?</h2>
          <div style={{ marginTop: "15px", marginBottom: "10px" }}>
            <RadioGroupRating
              value={rating}
              onChange={(value) => {
                setRating(value);
              }}
            />
          </div>
          <Button
            sx={{ borderRadius: "20px", marginTop: 1 }}
            onClick={async () => {
              const title = movie.movie_title;
              try {
                const res = await fetch(
                  "http://localhost:3000/api/watched/edit",
                  {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, value: rating }),
                    credentials: "include",
                  }
                );

                if (!res.ok) {
                  const err = await res.json();
                  console.log(
                    "Failed to update rating:",
                    err.error || res.statusText
                  );
                  return;
                }

                console.log("Rating updated successfully!");
                await fetchWatched();
                setOpen(false);
              } catch (error) {
                console.log("Error editing rating from watched!");
              }
            }}
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

export default MyCard;
