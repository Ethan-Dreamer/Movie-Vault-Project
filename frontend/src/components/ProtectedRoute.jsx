import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, colors } from "@mui/material";

export default function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return (
      <Box sx={styles.loaderContainer}>
        Redirecting...
      </Box>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

const styles = {
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "2rem",
    color: "rgb(195, 5, 5)",
  },
};