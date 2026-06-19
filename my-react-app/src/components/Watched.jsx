import React from "react";
import { useNavigate } from "react-router-dom";
import LocalMoviesRoundedIcon from "@mui/icons-material/LocalMoviesRounded";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MyCard from "./MyCard";

export default function Watched({ watched, fetchWatched, setWatched }) {
  const navigate = useNavigate();

  return (
    <Box className="watched-list-short">
      <Box className="watched-short-title">
        <LocalMoviesRoundedIcon fontSize="large" sx={styles.icon} />
        <Box component="h2">Watched Movies:</Box>
        <Button
          variant="outlined"
          onClick={() => navigate("/watched")}
          size="small"
          sx={styles.seeAllButton}
        >
          See all
        </Button>
      </Box>

      <Box className="watched-list">
        {watched?.length > 0 ? (
          watched.slice(0, 4).map((item, index) => (
            <MyCard
              key={item.id || index}
              id={index + 1}
              setWatched={setWatched}
              fetchWatched={fetchWatched}
              watched={watched}
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
  icon: {
    color: "white",
    marginRight: 1,
  },
  seeAllButton: {
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