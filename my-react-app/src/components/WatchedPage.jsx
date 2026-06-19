import React from "react";
import { useNavigate } from "react-router-dom";
import LocalMoviesRoundedIcon from "@mui/icons-material/LocalMoviesRounded";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MyCard from "./MyCard";

export default function WatchedPage({ watched, fetchWatched, setWatched }) {
  const navigate = useNavigate();

  return (
    <Box className="watched-page">
      <Box className="watched-short-title" sx={styles.headerBar}>
        <LocalMoviesRoundedIcon fontSize="large" sx={styles.icon} />
        <Box component="h2">Watched Movies:</Box>
        <Button
          variant="outlined"
          onClick={() => navigate("/home")}
          size="small"
          sx={styles.backButton}
        >
          Back
        </Button>
      </Box>

      <Box className="watched-list">
        {watched?.length > 0 ? (
          watched.map((item, index) => (
            <MyCard
              key={item.id || index}
              id={index + 1}
              setWatched={setWatched}
              watched={watched}
              fetchWatched={fetchWatched}
              movie={item}
              experience={item.experience}
              dateOfWatch={item.watched_date}
            />
          ))
        ) : (
          <Box component="p" sx={styles.emptyState}>
            No watched movies
          </Box>
        )}
      </Box>
    </Box>
  );
}

const styles = {
  headerBar: {
    backgroundColor: "rgb(195, 5, 5)",
  },
  icon: {
    color: "white",
    marginRight: 1,
  },
  backButton: {
    marginLeft: "auto",
    marginRight: "10px",
    color: "white",
    borderColor: "white",
  },
  emptyState: {
    color: "#555",
    fontSize: "large",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "60vh",
    textAlign: "center",
  },
};