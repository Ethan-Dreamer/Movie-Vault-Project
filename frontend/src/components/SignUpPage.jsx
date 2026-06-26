import React, { useState } from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import { Button, TextField, Box, Typography, InputAdornment, CircularProgress } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import GoogleIcon from "@mui/icons-material/Google";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const THEME = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
  },
  typography: {
    button: { textTransform: "none", fontWeight: 400 },
  },
});

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [retypePasswordError, setRetypePasswordError] = useState("");
  const [successError, setSuccessError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setGoogleLoading] = useState(false);

  const navigate = useNavigate();

  const signUpWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      window.location.href = `${API_URL}/auth/google`;
    } catch (error) {
      console.error("Error signing up with google: ", error);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await result.json();
      setSuccess(data.success);
      setLoading(false);

      if (data.success) {
        setSuccessError(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setSuccessError(data.message);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error while signing up!");
    }
  };

  return (
    <div className="login">
      <AppProvider theme={THEME}>
        <Box sx={styles.container}>
          <Box component="form" onSubmit={handleSubmit} sx={styles.formCard}>
            <Typography variant="h4" align="center" fontWeight={500} color="rgb(195, 5, 5)">
              Sign Up
            </Typography>

            {successError && (
              <Typography
                variant="body1"
                align="center"
                sx={styles.alertText(success, successError)}
              >
                {successError}
              </Typography>
            )}

            <TextField
              label="Username"
              value={username}
              onChange={(e) => {
                const value = e.target.value;
                setUsername(value);

                if (!/^[a-zA-Z0-9._@]*$/.test(value)) {
                  setError("invalidChars");
                } else if (value.length < 4) {
                  setError("lengthError");
                } else if (/[A-Z]/.test(value)) {
                  setError("capitalError")
                } else {
                  setError("");
                }
              }}
              error={!!error}
              helperText={
                error === "lengthError"
                  ? "At least 4 characters allowed!"
                  : error === "invalidChars"
                    ? "Only letters, numbers, _ , and . allowed"
                    : error === "capitalError" ? "No capital letters allowed for username!" : " "
              }
              FormHelperTextProps={{ sx: styles.helperText }}
              fullWidth
              variant="outlined"
              required
              slotProps={{
                input: {
                  endAdornment: username && !error && (
                    <InputAdornment position="end">
                      <CheckIcon sx={styles.checkIcon} />
                    </InputAdornment>
                  ),
                },
              }}
              autoComplete="off"
              sx={styles.textField(username, error)}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                if (val.length < 4) {
                  setPasswordError("Too short");
                } else {
                  setPasswordError("");
                }
              }}
              error={!!passwordError}
              helperText={passwordError ? "At least 4 characters required!" : ""}
              FormHelperTextProps={{ sx: styles.helperText }}
              fullWidth
              required
              autoComplete="off"
              slotProps={{
                input: {
                  endAdornment: password && !passwordError && (
                    <InputAdornment position="end">
                      <CheckIcon sx={styles.checkIcon} />
                    </InputAdornment>
                  ),
                },
              }}
              variant="outlined"
              sx={styles.textField(password, passwordError)}
            />

            <TextField
              label="Re-type password"
              type="password"
              value={retypePassword}
              onChange={(e) => {
                const val = e.target.value;
                setRetypePassword(val);

                if (val.length < 4) {
                  setRetypePasswordError("At least 4 characters required!");
                } else if (val !== password) {
                  setRetypePasswordError("Passwords do not match!");
                } else {
                  setRetypePasswordError("");
                }
              }}
              error={!!retypePasswordError}
              helperText={retypePasswordError}
              FormHelperTextProps={{ sx: styles.helperText }}
              fullWidth
              required
              autoComplete="off"
              slotProps={{
                input: {
                  endAdornment: retypePassword && !retypePasswordError && (
                    <InputAdornment position="end">
                      <CheckIcon sx={styles.checkIcon} />
                    </InputAdornment>
                  ),
                },
              }}
              variant="outlined"
              sx={styles.textField(retypePassword, retypePasswordError)}
            />

            <Button
              type="submit"
              color="error"
              variant="contained"
              disabled={
                !username ||
                !password ||
                !retypePassword ||
                !!passwordError ||
                !!retypePasswordError ||
                !!error ||
                loading
              }
              sx={styles.button}
            >
              {loading ? (
                <CircularProgress size={24} sx={styles.progressWhite} />
              ) : (
                "Register"
              )}
            </Button>

            <Button
              onClick={signUpWithGoogle}
              variant="outlined"
              color="error"
              disabled={loadingGoogle}
              sx={styles.button}
            >
              {loadingGoogle ? (
                <CircularProgress size={24} sx={styles.progressGray} />
              ) : (
                <>
                  <GoogleIcon sx={styles.googleIcon} />
                  Sign up with Google
                </>
              )}
            </Button>
          </Box>
        </Box>
      </AppProvider>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: "50px",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  button: {
    height: 44,
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 400,
  },
  progressWhite: {
    color: "white",
  },
  progressGray: {
    color: "rgba(184,184,184,1)",
  },
  googleIcon: {
    marginRight: 1,
  },
  checkIcon: {
    color: "green",
  },
  helperText: {
    color: "red",
  },
  alertText: (success, successError) => ({
    backgroundColor: success ? "rgba(12, 225, 111, 0.3)" : "rgba(255, 0, 0, 0.3)",
    padding: 1,
    color: success ? "green" : "rgb(195, 5, 5)",
    fontWeight: 500,
    marginBottom: "-5px",
    transition: "all 0.5s ease",
    opacity: successError ? 1 : 0,
    transform: successError ? "translateY(0)" : "translateY(-10px)",
  }),
  textField: (value, error) => ({
    borderRadius: "8px",
    backgroundColor: "white",
    "& label.Mui-focused": {
      color: !value ? "rgb(195, 5, 5)" : error ? "red" : "rgb(15, 169, 88)",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: !value ? "gray" : error ? "red" : "rgb(15, 169, 88)",
      },
      "&:hover fieldset": { borderColor: "black" },
      "&.Mui-focused fieldset": {
        borderColor: !value ? "rgb(195, 5, 5)" : error ? "red" : "rgb(15, 169, 88)",
      },
    },
  }),
};