import * as React from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import { Button, TextField, Box, Typography } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import GoogleIcon from "@mui/icons-material/Google";
import CheckIcon from "@mui/icons-material/Check";
import { InputAdornment } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

export default function LoginPage() {
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [successError, setSuccessError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingGoogle, setGoogleLoading] = React.useState(false);

  const signInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      window.location.href = "http://localhost:3000/auth/google";
    } catch (error) {
      console.log("Error while signing in: ", error);
    }
  };

  const navigate = useNavigate();

  const THEME = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#1976d2" },
    },
    typography: {
      button: { textTransform: "none", fontWeight: 400 },
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await result.json();
      setLoading(false);
      setSuccess(data.success);
      if (data.success) {
        setSuccessError(data.message);
        window.location.href='/home';
      } else {
        setSuccessError(data.message);
      }
    } catch (error) {
      console.log("Error while loging in!");
    }
  };

  return (
    <div className="login">
      <AppProvider theme={THEME}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
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
            }}
          >
            <Typography
              variant="h4"
              align="center"
              fontWeight={500}
              color="rgb(195, 5, 5)"
            >
              Log In
            </Typography>

            {successError && (
              <Typography
                variant="body1"
                align="center"
                sx={{
                  backgroundColor: success
                    ? "rgba(12, 225, 111, 0.3)"
                    : "rgba(255, 0, 0, 0.3)",
                  padding: 1,
                  color: success ? "green" : "rgb(195, 5, 5)",
                  fontWeight: 500,
                  marginBottom: "-5px",
                  transition: "all 0.5s ease",
                  opacity: successError ? 1 : 0,
                  transform: successError
                    ? "translateY(0)"
                    : "translateY(-10px)",
                }}
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

                if (!/^[a-zA-Z0-9._]*$/.test(value)) {
                  setError("invalidChars");
                } else if (value.length < 4) {
                  setError("lengthError");
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
                    : ""
              }
              FormHelperTextProps={{ style: { color: "red" } }}
              fullWidth
              variant="outlined"
              required
              slotProps={{
                input: {
                  endAdornment: username && !error && (
                    <InputAdornment position="end">
                      <CheckIcon sx={{ color: "green" }} />
                    </InputAdornment>
                  ),
                },
              }}
              autoComplete="off"
              sx={{
                borderRadius: "8px",
                backgroundColor: "white",
                "& label.Mui-focused": {
                  color: !username
                    ? "rgb(195, 5, 5)"
                    : error
                      ? "red"
                      : "rgb(15, 169, 88)",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: !username
                      ? "gray"
                      : error
                        ? "red"
                        : "rgb(15, 169, 88)",
                  },
                  "&:hover fieldset": { borderColor: "black" },

                  "&.Mui-focused fieldset": {
                    borderColor: !username
                      ? "rgb(195, 5, 5)"
                      : error
                        ? "red"
                        : "rgb(15, 169, 88)",
                  },
                },
              }}
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
              helperText={
                passwordError ? "At least 4 characters required!" : ""
              }
              FormHelperTextProps={{ style: { color: "red" } }}
              fullWidth
              required
              autoComplete="off"
              slotProps={{
                input: {
                  endAdornment: password && !passwordError && (
                    <InputAdornment position="end">
                      <CheckIcon sx={{ color: "green" }} />
                    </InputAdornment>
                  ),
                },
              }}
              variant="outlined"
              sx={{
                borderRadius: "8px",
                backgroundColor: "white",
                "& label.Mui-focused": {
                  color: !password
                    ? "rgb(195, 5, 5)"
                    : passwordError
                      ? "red"
                      : "rgb(15, 169, 88)",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: !password
                      ? "gray"
                      : passwordError
                        ? "red"
                        : "rgb(15, 169, 88)",
                  },
                  "&:hover fieldset": { borderColor: "black" },
                  "&.Mui-focused fieldset": {
                    borderColor: !password
                      ? "rgb(195, 5, 5)"
                      : passwordError
                        ? "red"
                        : "rgb(15, 169, 88)",
                  },
                },
              }}
            />

            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>

            <Button
              type="submit"
              color="error"
              variant="contained"
              disabled={
                !username || !password || passwordError || error || loading
              }
              sx={{
                height: 44,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 400,
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Log in"
              )}
            </Button>

            <Button
              onClick={signInWithGoogle}
              variant="outlined"
              color="error"
              disabled={loadingGoogle}
              sx={{
                height: 44,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 400,
              }}
            >
              {loadingGoogle ? (
                <CircularProgress
                  size={24}
                  sx={{ color: "rgba(184,184,184,1)" }}
                />
              ) : (
                <>
                  <GoogleIcon sx={{ marginRight: 1 }} />
                  Sign in with Google
                </>
              )}
            </Button>
          </Box>
        </Box>
      </AppProvider>
    </div>
  );
}
