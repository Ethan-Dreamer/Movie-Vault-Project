import React from "react";
import MyCard from "./Card";
import { useNavigate } from "react-router-dom";
import LocalMoviesRoundedIcon from "@mui/icons-material/LocalMoviesRounded";
import Button from "@mui/material/Button";

export default function Watched({ watched, fetchWatched ,setWatched}) {
  const navigate = useNavigate();
  return (
    <div className="watched-list-short">
      <div className="watched-short-title">
        <LocalMoviesRoundedIcon
          htmlColor="white"
          fontSize="large"
          sx={{ marginRight: 1 }}
        />
        <h2>Watched Movies:</h2>
        <Button
          variant="outlined"
          onClick={() => navigate("/watched")}
          size="small"
          color="white"
          sx={{ marginLeft: "auto", marginRight: "10px" }}
        >
          See all
        </Button>
      </div>

      <div className="watched-list">
        {watched && watched.length > 0 ? (
          watched
            .slice(0, 4)
            .map((item, index) => (
              <MyCard
                key={index}
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
