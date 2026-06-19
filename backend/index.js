import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import { Strategy } from "passport-local";
import session from "express-session";

dotenv.config();

const app = express();
const port = 3000;
const saltRounds = 10;
const token = process.env.TOKEN;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASS,
  port: 5432,
});

db.connect().catch((err) => console.error("Database connection error:", err));

app.use((req, res, next) => {
  if (req.session.passport?.user && !req.user) {
    req.user = req.session.passport.user;
  }
  next();
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/movievault",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    res.redirect("http://localhost:5173/home");
  }
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect("http://localhost:5173/login");
  });
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info?.message || "Invalid credentials" });

    req.logIn(user, (err) => {
      if (err) return next(err);

      req.session.save((err) => {
        if (err) return next(err);
        return res.json({ success: true, message: "Logged in successfully!" });
      });
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE username = $1;", [username]);

    if (checkResult.rows.length > 0) {
      return res.status(409).json({ success: false, message: "User already registered!" });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await db.query("INSERT INTO users (username, password_hash) VALUES ($1, $2);", [username, hash]);

    return res.status(201).json({ success: true, message: "User registered successfully! Login now." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during registration." });
  }
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not logged in" });
}

app.get("/api/watched", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query("SELECT * FROM watched_movies WHERE user_id=$1;", [userId]);
    return res.json({ watched: result.rows || [] });
  } catch (error) {
    console.error("Fetch watched error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/watched", isAuthenticated, async (req, res) => {
  const { movie, dateOfWatch, experience } = req.body;
  const userId = req.user.id;

  if (!movie) return res.status(400).json({ error: "No movie provided" });

  const title = movie.title || movie.original_title || movie.original_name || "Untitled";
  const overview = movie.overview || "";
  const watched_date = dateOfWatch || new Date().toISOString().split("T")[0];
  const exp = experience !== "" ? experience : null;
  const poster_url = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;

  try {
    await db.query(
      "INSERT INTO watched_movies (movie_title, movie_overview, watched_date, experience, poster_url, user_id) VALUES($1, $2, $3, $4, $5, $6);",
      [title, overview, watched_date, exp, poster_url, userId]
    );
    return res.status(201).json({ message: `${title} marked as watched!` });
  } catch (error) {
    console.error("Insert error:", error);
    return res.status(500).json({ error: "Internal server error while saving movie" });
  }
});

app.get("/api/watched/search", isAuthenticated, async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: "No title provided" });

  try {
    const result = await db.query("SELECT * FROM watched_movies WHERE movie_title=$1 AND user_id=$2;", [
      title,
      req.user.id,
    ]);
    return res.json({ exist: result.rows.length > 0 });
  } catch (error) {
    console.error("Search watched error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/watched/delete", isAuthenticated, async (req, res) => {
  const { title } = req.body;
  const userId = req.user.id;

  if (!title) return res.status(400).json({ error: "Missing title!" });

  try {
    await db.query("DELETE FROM watched_movies WHERE movie_title=$1 AND user_id=$2;", [title, userId]);
    return res.json({ message: "Movie deleted successfully!" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Internal server error while deleting" });
  }
});

app.patch("/api/watched/edit", isAuthenticated, async (req, res) => {
  const { value: newRating, title: movieTitle } = req.body;
  const userId = req.user.id;

  if (!newRating || !movieTitle) return res.status(400).json({ error: "Rating or title missing!" });

  try {
    await db.query("UPDATE watched_movies SET experience=$1 WHERE movie_title=$2 AND user_id=$3;", [
      newRating,
      movieTitle,
      userId,
    ]);
    return res.json({ message: "Rating updated successfully!" });
  } catch (error) {
    console.error("Edit rating error:", error);
    return res.status(500).json({ error: "Internal server error while updating" });
  }
});

app.post("/api/search", async (req, res) => {
  const { movie } = req.body;
  if (!movie) return res.status(400).json({ error: "Movie name is required!" });

  const movieUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie)}`;
  const tvUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(movie)}`;

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(movieUrl, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(tvUrl, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const movieData = await movieRes.json();
    const tvData = await tvRes.json();

    const combined = [...(movieData.results || []), ...(tvData.results || [])]
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, 3);

    return res.json({ movieDetails: combined });
  } catch (error) {
    console.error("External search error:", error);
    return res.status(500).json({ error: "Internal server error while fetching details" });
  }
});

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE username=$1;", [username]);
      if (result.rows.length === 0) return cb(null, false, { message: "User not found!" });

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      
      if (valid) return cb(null, user);
      return cb(null, false, { message: "Incorrect password!" });
    } catch (error) {
      return cb(error);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/movievault",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE username=$1;", [profile.email]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (username, password_hash) VALUES($1, $2) RETURNING *;",
            [profile.email, "google-oauth"]
          );
          return cb(null, newUser.rows[0]);
        }
        return cb(null, result.rows[0]);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

passport.serializeUser((user, cb) => cb(null, user.id));

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id=$1;", [id]);
    if (result.rows.length === 0) return cb(null, false);
    return cb(null, result.rows[0]);
  } catch (err) {
    return cb(err);
  }
});

app.get("/check-auth", (req, res) => {
  return res.json({ user: req.user || null });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));