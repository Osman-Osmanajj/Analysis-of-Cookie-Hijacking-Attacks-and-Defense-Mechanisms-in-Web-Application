
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import createAuthRoutes from "./routes/authRoutes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAuth } from "./middleware/authMiddleware.js";   
import { connectDatabase } from "./config/database.js";
import createRegisterRoutes from "./routes/registerRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET mungon në .env");
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
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        }
    })
);

const database = await connectDatabase();
const usersCollection = database.collection("users");
await usersCollection.createIndex(
    {username: 1},
    {unique: true}
);
app.use("/api/auth", createRegisterRoutes(usersCollection));

app.use("/api/auth",createAuthRoutes(usersCollection));

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

app.get("/dashboard",requireAuth,(req,res) => {
    res.sendFile(path.join(__dirname,"views","dashboard.html"));
});

app.get("/security-lab",requireAuth,(req,res)=>{
    res.sendFile(
        path.join(__dirname,"views","security-lab.html")
    );
});
app.use(express.static(path.join(__dirname, "public")));

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
