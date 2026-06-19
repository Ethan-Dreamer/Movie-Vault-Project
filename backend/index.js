import express from "express";
import cors from "cors";
import env from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import { Strategy } from "passport-local";
import session from "express-session";

env.config();

const app = express();
const port = 3000;
const saltRounds = 10;
const token = process.env.TOKEN;

//  Session setup — FIXED
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true if using HTTPS
      sameSite: "lax", // allows cookies in local dev
    },
  })
);

//  CORS setup (make sure this matches your frontend)
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

//  Database connection
const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASS,
  port: 5432,
});
db.connect();

//  Manual session restore 
app.use((req, res, next) => {
  if (req.session.passport?.user && !req.user) {
    req.user = req.session.passport.user;
  }
  next();
});

//  AUTH ROUTES 

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
    res.redirect("http://localhost:5173/login");
  });
});

//  Local login
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


//  Local register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE username = $1;", [username]);

    if (checkResult.rows.length > 0) {
      return res.json({ success: false, message: "User already registered!" });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await db.query("INSERT INTO users (username, password_hash) VALUES ($1, $2);", [username, hash]);

    res.json({ success: true, message: "User registered successfully! Login now." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).send(`Error while registering: ${error.message}`);
  }
});

//  WATCHED MOVIES 

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not logged in" });
}

app.get("/api/watched", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query("SELECT * FROM watched_movies WHERE user_id=$1;", [userId]);
    res.json({ watched: result.rows || [] });
  } catch (error) {
    res.status(500).json({ error: `Error while fetching: ${error.message}` });
  }
});

app.post("/api/watched", isAuthenticated, async (req, res) => {
  const item = req.body;
  const userId = req.user.id;
  const movie = item.movie;

  if (!movie) return res.status(400).json({ error: "No movie provided" });
  const title = movie.title || movie.original_title || movie.original_name || "Untitled";
  const overview = movie.overview || "";
  const watched_date = item.dateOfWatch || new Date().toISOString().split("T")[0];
  const experience = item.experience !== "" ? item.experience : null;
  const poster_url = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;

  try {
    await db.query(
      "INSERT INTO watched_movies (movie_title,movie_overview,watched_date,experience,poster_url,user_id) VALUES($1,$2,$3,$4,$5,$6);",
      [title, overview, watched_date, experience, poster_url, userId]
    );
    res.json({ message: `${title} marked as watched!` });
  } catch (error) {
    console.error("Insert error:", error); // log full error
    res.status(500).json({ error: `Error while inserting: ${error.message}` });
  }
});


app.get("/api/watched/search", isAuthenticated, async (req, res) => {
  const title = req.query.title;
  if (!title) return res.status(400).json({ error: "No title provided" });

  try {
    const result = await db.query("SELECT * FROM watched_movies WHERE movie_title=$1 AND user_id=$2;", [
      title,
      req.user.id,
    ]);
    res.json({ exist: result.rows.length > 0 });
  } catch (error) {
    res.status(500).json(`Error while searching: ${error.message}`);
  }
});

app.delete("/api/watched/delete", isAuthenticated, async (req, res) => {
  const title = req.body.title;
  const userId = req.user.id;

  try {
    if (title && userId) {
      await db.query("DELETE FROM watched_movies WHERE movie_title=$1 AND user_id=$2;", [title, userId]);
      res.json({ message: "Movie deleted successfully!" });
    } else {
      res.status(400).json({ error: "Missing title or user ID!" });
    }
  } catch (error) {
    res.status(500).json({ error: `Error while deleting: ${error.message}` });
  }
});

app.patch("/api/watched/edit", isAuthenticated, async (req, res) => {
  const newRating = req.body.value;
  const movieTitle = req.body.title;
  const userId = req.user.id;
  try {
    if (newRating && movieTitle) {
      await db.query("UPDATE watched_movies SET experience=$1 WHERE movie_title=$2 AND user_id=$3;", [
        newRating,
        movieTitle,
        userId,
      ]);
      res.json({ message: "Rating updated successfully!" });
    } else {
      res.status(400).json({ error: "Rating or title missing!" });
    }
  } catch (error) {
    res.status(500).json({ error: `Error while updating: ${error.message}` });
  }
});

//  SEARCH MOVIES 

app.post("/api/search", async (req, res) => {
  const movieName = req.body.movie;
  if (!movieName) return res.status(400).json({ error: "Movie name is required!" });

  const movieUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}`;
  const tvUrl = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(movieName)}`;

  try {
    const movieRes = await fetch(movieUrl, { headers: { Authorization: `Bearer ${token}` } });
    const movieData = await movieRes.json();

    const tvRes = await fetch(tvUrl, { headers: { Authorization: `Bearer ${token}` } });
    const tvData = await tvRes.json();

    const combined = [...(movieData.results || []), ...(tvData.results || [])]
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, 3);

    res.json({ movieDetails: combined });
  } catch (error) {
    res.status(500).json({ error: `Error while fetching: ${error.message}` });
  }
});

//  PASSPORT 

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE username=$1;", [username]);
      if (result.rows.length === 0) return cb(null, false, { message: "User not found!" });

      const user = result.rows[0];
      const storedHash = user.password_hash;
      bcrypt.compare(password, storedHash, (err, valid) => {
        if (err) return cb(err);
        if (valid) return cb(null, user);
        else return cb(null, false, { message: "Incorrect password!" });
      });
    } catch (error) {
      cb(error);
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
            "INSERT INTO users (username,password_hash) VALUES($1,$2) RETURNING *;",
            [profile.email, "google-oauth"]
          );
          // const existing = await db.query("SELECT * FROM user_profiles WHERE user_id=$1", [newUser.rows[0].id]);
          // if (existing.rows.length === 0) {
          //   await db.query(
          //     "INSERT INTO user_profiles (user_id, photo_url, display_name) VALUES($1,$2,$3)",
          //     [newUser.rows[0].id, profile.picture, profile.given_name]
          //   );
          // }
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (error) {
        cb(error);
      }
    }
  )
);

passport.serializeUser((user, cb) => cb(null, user.id));
passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id=$1;", [id]);
    if (result.rows.length === 0) return cb(null, false);
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

//  TEST ROUTE 
app.get("/check-auth", (req, res) => {
  res.json({ user: req.user || null });
});

//  START 
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
