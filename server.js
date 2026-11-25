import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import createAuthRoutes from "./routes/authRoutes.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAuth } from "./middleware/authMiddleware.js";   
import { connectDatabase } from "./config/database.js";
import createRegisterRoutes from "./routes/registerRoutes.js";
import { createServer } from "node:https";
import { readFileSync } from "node:fs";
import helmet  from "helmet";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HTTPS_ENABLED = process.env.HTTPS_ENABLED === "true";
const SESSION_COOKIE_NAME = HTTPS_ENABLED
    ?"__Host-diploma_session" : "diploma_session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET mungon në .env");
}

app.use(helmet({
    contentSecurityPolicy:{
        directives: {
            "upgrade-insecure-requests": null
        }
    },
    strictTransportSecurity: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//http true or false to enable


const SESSION_COOKIE_SETTINGS = {
    path: "/",
    httpOnly: true,
    secure: HTTPS_ENABLED,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000
};

app.use(session({
    name: SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: SESSION_COOKIE_SETTINGS
}));
app.use((req,res,next) =>{
    if(!req.session.user){
        return next();
    }
    const currentUserAgent = req.get("User-Agent") ?? "";
    if(req.session.browserUserAgent === currentUserAgent){
        return next();
    }
    req.session.destroy((error)=>{
        if(error){
            return next(error);
        }
        res.clearCookie(SESSION_COOKIE_NAME,{
            path: "/",
            secure: HTTPS_ENABLED,
            httpOnly: true,
            sameSite: "lax"
        });

        if(req.path.startsWith("/api/")){
            return res.status(401).json({
                success: false,
                message: "Sessioni u anulua sepse ndryshoi shfletuesi.Kyçu perseri!"
            });
        }
        return res.redirect("/login.html");
    });
});

const database = await connectDatabase();
const usersCollection = database.collection("users");
await usersCollection.createIndex(
    {username: 1},
    {unique: true}
);
app.use("/api/auth", createRegisterRoutes(usersCollection));

app.use("/api/auth",createAuthRoutes(usersCollection,SESSION_COOKIE_NAME,HTTPS_ENABLED));

app.get("/", (req, res) => {
    res.redirect("/login.html");
});
app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
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

app.get("/api/status", (req, res) => {
    res.json({
        application: "Cookie Hijacking Analysis",
        status: "Running",
        protocol: HTTPS_ENABLED ? "HTTPS" : "HTTP",
        cookie: {
            name:  SESSION_COOKIE_NAME,
            httpOnly: SESSION_COOKIE_SETTINGS.httpOnly,
            secure: SESSION_COOKIE_SETTINGS.secure,
            sameSite: SESSION_COOKIE_SETTINGS.sameSite,
            maxAgeMinutes: SESSION_COOKIE_SETTINGS.maxAge / 60000
        }
    });
});
//Komanda per HTTPS enable
if (HTTPS_ENABLED) {
    const server = createServer(
        {
            key: readFileSync(path.join(__dirname, "certs", "localhost-key.pem")),
            cert: readFileSync(path.join(__dirname, "certs", "localhost.pem"))
        },
        app
    );

    server.listen(PORT, "127.0.0.1", () => {
        console.log(`Server running at https://127.0.0.1:${PORT}`);
    });
} else {
    app.listen(PORT, "127.0.0.1", () => {
        console.log(`Server running at http://127.0.0.1:${PORT}`);
    });
}