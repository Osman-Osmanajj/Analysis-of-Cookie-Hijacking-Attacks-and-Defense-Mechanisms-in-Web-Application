import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

export default function createAuthRoutes(usersCollection,sessionCookieName,httpsEnabled){
    router.post("/login",async (req,res) =>{
        try {
            const { username: submittedUsername, password} = req.body;
              if (
            typeof submittedUsername !== "string" ||
            !submittedUsername.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }
            const normalizedUsername = submittedUsername.trim().toLowerCase();
            const user = await usersCollection.findOne({
            username: normalizedUsername
        });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }
            // Generate a new session ID after login
            req.session.regenerate((error) =>{
                if(error){
                    return res.status(500).json({
                        success: false,
                        message: "Couldn't create session"
                    });
                }
                req.session.user ={
                    username:user.username
                };
                req.session.browserUserAgent = req.get("User-Agent") ?? "";
                req.session.save((saveError) =>{
                    if(saveError){
                        return res.status(500).json({
                            success:false,
                            message: "Couldn't save session"
                        });
                    }
                    return res.json({
                        success:true,
                        message:"Login successful!",
                        username: user.username
                    });
                });
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    });
    router.get("/me",(req,res) =>{
        if(!req.session.user){
            return res.status(401).json({
                success:false,
                message: "You are not authenticated"
            });
        }
        res.json({
            success: true,
            user: req.session.user
        });
    });
    router.post("/logout",(req,res) =>{
        req.session.destroy((error) =>{
            if(error) {
                return res.status(500).json({
                    success: false,
                    message: "Logout failed"
                });
            }
            res.clearCookie(sessionCookieName,{
                path: "/",
                secure: httpsEnabled,
                httpOnly: true,
                sameSite: "lax"
            });

            res.json({
                success:true,
                message: "Logout successful"
            });
        });
    });

    return router;
}
