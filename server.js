
import express from "express";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is missing in .env file");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        name: "diploma_session",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        }
    })
);

app.use(express.static("public"));

app.get("/api/session-test", (req, res) => {
    req.session.demo = true;

    res.json({
        success: true,
        message: "Test session created successfully!"
    });
});

app.get("/api/status", (req, res) => {
    res.json({
        application: "Cookie Hijacking Analysis",
        status: "Running",
        mode: "Insecure Lab"
    });
});

app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});
