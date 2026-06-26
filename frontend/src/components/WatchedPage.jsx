import React from "react";
import { useNavigate } from "react-router-dom";
import LocalMoviesRoundedIcon from "@mui/icons-material/LocalMoviesRounded";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MyCard from "./MyCard";
import SubHeader from "./SubHeader";

export default function WatchedPage({ watched, fetchWatched, setWatched }) {
  const navigate = useNavigate();

  return (
    <Box className="watched-page">
      <SubHeader title={"Watched Movies"} />
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