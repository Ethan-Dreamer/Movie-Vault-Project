import React from "react";
import MyCard from "./Card";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import LocalMoviesRoundedIcon from "@mui/icons-material/LocalMoviesRounded";

export default function WatchedPage({ watched , fetchWatched ,setWatched }) {
  const navigate = useNavigate();
  return (
    <div className="watched-page">
      <div
        className="watched-short-title"
        style={{ backgroundColor: "rgb(195, 5, 5)" }}
      >
        <LocalMoviesRoundedIcon
          htmlColor="white"
          fontSize="large"
          sx={{ marginRight: 1 }}
        />
        <h2>Watched Movies:</h2>
        <Button
          variant="outlined"
          onClick={() => navigate("/home")}
          size="small"
          color="white"
          sx={{ marginLeft: "auto", marginRight: "10px" }}
        >
          Back
        </Button>
      </div>

      <div className="watched-list">
        {watched && watched.length > 0 ? (
          watched.map((item, index) => (
            <MyCard
              key={index}
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
          <p
            style={{
              color: "#555",
              fontSize: "large",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
              textAlign: "center",
            }}
          >
            No watched movies
          </p>
        )}
      </div>
    </div>
  );
}
