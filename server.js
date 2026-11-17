
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import createAuthRoutes from "./routes/authRoutes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAuth } from "./middleware/authMiddleware.js";   

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.SESSION_SECRET || !process.env.DEMO_USERNAME || !process.env.DEMO_PASSWORD) {
    throw new Error("Required enviroment variables are missing");
    
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

const passwordHash = await bcrypt.hash(
    process.env.DEMO_PASSWORD,
    12
);

app.use("/api/auth",
    createAuthRoutes({
        username:process.env.DEMO_USERNAME,
        passwordHash:passwordHash
    })
);

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
