import React, { useState } from "react";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMediaQuery, Box } from "@mui/material";
import {API_URL} from "../config";
import PopUp from "./PopUp";
import RadioGroupRating, { customIcons } from "./RadioGroupRating";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [rating, setRating] = useState(experience || 3);
  const isMobile = useMediaQuery("(max-width:600px)");

  const handleDelete = async () => {
    const title = movie.movie_title;
    try {
      const res = await fetch(`${API_URL}/api/watched/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      
      const data = await res.json();

      if (res.ok) {
        setWatched([]); 
        await fetchWatched();
        console.log("Deleted movie:", title);
        setIsDeleteOpen(false);
      } else {
        console.error("Error deleting movie:", data.error);
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const handleEditRating = async () => {
    const title = movie.movie_title;
    try {
      const res = await fetch(`${API_URL}/api/watched/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, value: rating }),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to update rating:", err.error || res.statusText);
        return;
      }

      console.log("Rating updated successfully!");
      await fetchWatched();
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error editing rating from watched!", error);
    }
  };

  const charLimit = isMobile ? 70 : 150;
  const overviewText = movie.movie_overview
    ? movie.movie_overview.length > charLimit
      ? `${movie.movie_overview.slice(0, charLimit)}...`
      : movie.movie_overview
    : "";

  return (
    <Box
      className={`card ${suggestion ? "clickable" : ""}`}
      sx={styles.cardCursor(suggestion)}
      onClick={suggestion ? onClick : null}
    >
      <div className="card-details">
        <Box sx={styles.flexRow}>
          <Box component="h2" className="card-title" sx={styles.flexRow}>
            {suggestion ? `${movie.title || movie.original_name}` : `${id}. ${movie.movie_title}`}
            
            {!suggestion && (
              <DeleteIcon
                onClick={() => setIsDeleteOpen(true)}
                htmlColor="#c30505"
                sx={styles.deleteIcon}
              />
            )}
          </Box>
          
          {suggestion && (
            <>
              <Rating
                value={movie.vote_average / 2}
                precision={0.5}
                readOnly
                size="small"
                sx={styles.rating}
              />
              <Box component="span" sx={styles.ratingText(isMobile)}>
                {(movie.vote_average / 2).toFixed(1)}
              </Box>
            </>
          )}
        </Box>

        {suggestion ? (
          <Box className="text-on-mobile" sx={styles.mobileText}>
            <p>{`Release Date: ${movie.release_date || movie.first_air_date}`}</p>
            <p>{`Total Votes: ${movie.vote_count}`}</p>
          </Box>
        ) : (
          <div className="card-description">
            <p>{overviewText}</p>
            <Box component="p" sx={styles.watchedDate}>
              <Box component="span" sx={styles.bold}>Set to watched on: </Box>
              {new Date(dateOfWatch).toLocaleDateString()}
            </Box>
            <Box sx={styles.flexRow}>
              <Box component="span" sx={styles.bold}>Experience:</Box>
              {customIcons[experience]?.icon || <span>Not rated!</span>}
              <Button
                onClick={() => setIsEditOpen(true)}
                variant="contained"
                color="success"
                sx={styles.editButton}
              >
                Edit
              </Button>
            </Box>
          </div>
        )}
      </div>

      <Box
        component="img"
        src={`https://image.tmdb.org/t/p/w500${movie.poster_url || movie.poster_path}`}
        alt={movie.poster_url || movie.poster_path}
        sx={styles.poster(suggestion, isMobile)}
      />

      <PopUp removeClose={true} isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
        <div className="delete-popup">
          <p>
            Are you sure you want to remove{" "}
            <Box component="span" sx={styles.deleteTitleHighlight}>
              {movie.movie_title}
            </Box>
            ?
          </p>
          <img
            className="delete-popup-img"
            src={`https://image.tmdb.org/t/p/w500${movie.poster_url}`}
            alt={movie.poster_url}
          />
          <div>
            <Button
              onClick={handleDelete}
              variant="outlined"
              color="error"
              size="small"
              sx={styles.removeBtn}
              startIcon={<DeleteIcon />}
            >
              Remove
            </Button>
            <Button
              onClick={() => setIsDeleteOpen(false)}
              variant="contained"
              sx={styles.cancelBtn}
              size="small"
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopUp>

      <PopUp isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <div>
          <h2>How would u like to rate this?</h2>
          <Box sx={styles.radioWrapper}>
            <RadioGroupRating
              value={rating}
              onChange={(value) => setRating(value)}
            />
          </Box>
          <Button
            sx={styles.submitBtn}
            onClick={handleEditRating}
            variant="contained"
            color="success"
          >
            Submit
          </Button>
        </div>
      </PopUp>
    </Box>
  );
}

const styles = {
  cardCursor: (suggestion) => ({
    cursor: suggestion ? "pointer" : "default",
  }),
  flexRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  deleteIcon: {
    cursor: "pointer",
    fontSize: { xs: "16px", sm: "24px" },
  },
  rating: {
    display: { xs: "none", sm: "inline-flex" },
  },
  ratingText: (isMobile) => ({
    fontSize: "14px",
    color: "#555",
    transform: "translateY(1px)",
    display: isMobile ? "none" : "inline",
  }),
  mobileText: {
    color: "#555",
    marginTop: "10px",
  },
  watchedDate: {
    margin: "10px 0",
  },
  bold: {
    fontWeight: "bold",
  },
  editButton: {
    height: "20px",
    minWidth: "30px",
    padding: "0 6px",
    fontSize: "0.7rem",
    lineHeight: 1,
  },
  poster: (suggestion, isMobile) => ({
    maxHeight: suggestion ? "120px" : isMobile ? "160px" : "190px",
  }),
  deleteTitleHighlight: {
    fontWeight: "bold",
    color: "#c30505",
  },
  removeBtn: {
    marginRight: 1,
  },
  cancelBtn: {
    color: "black",
    backgroundColor: "white",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  },
  radioWrapper: {
    marginTop: "15px",
    marginBottom: "10px",
  },
  submitBtn: {
    borderRadius: "20px",
    marginTop: 1,
  },
};

export default MyCard;