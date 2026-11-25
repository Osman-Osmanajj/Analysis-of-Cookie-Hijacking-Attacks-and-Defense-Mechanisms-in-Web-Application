import express from "express";
import bcrypt from "bcrypt";

export default function createRegisterRoutes(usersCollection) {
    const router = express.Router();

    router.post("/register",async(req,res) =>{
       const username =
        typeof req.body?.username === "string"
        ? req.body.username.trim().toLowerCase()
        : "";

const password = req.body?.password;

if (!username || typeof password !== "string" || !password) {
    return res.status(400).json({
        success: false,
        message: "Username dhe password janë të detyrueshëm"
    });
}
      try {
            const passwordHash = await bcrypt.hash(password, 12);

            await usersCollection.insertOne({
                username,
                passwordHash,
                createdAt: new Date()
            });

            return res.status(201).json({
                success: true,
                message: "Përdoruesi u regjistrua me sukses"
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Ky username ekziston"
                });
            }

            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Regjistrimi dështoi"
            });
        }
    });

    return router;
}

