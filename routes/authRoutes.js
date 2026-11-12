import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

export default function createAuthRoutes({username,passwordHash}){
    router.post("/login",async (req,res) =>{
        try {
            const { username: submittedUsername, password} = req.body;

            if(!submittedUsername || !password){
                return res.status(404).json({
                    success: false,
                    message: "Username and password are required"
                });
            }
            const validUsername = submittedUsername === username;
            const validPassword = await bcrypt.compare(
                password,
                passwordHash
            );

            if(!validUsername || !validPassword){
                return res.status(404).json({
                    success: false,
                    message: "Invalid username or password"
                });
            }
            // Generate a new session ID after login
            req.session.regenerate((error) =>{
                if(error){
                    return res.status(404).json({
                        success: false,
                        message: "Couldn't create session"
                    });
                }
                req.session.user ={
                    username:username
                };
                req.session.save((saveError) =>{
                    if(saveError){
                        return res.status(404).json({
                            success:false,
                            message: "Couldn't save session"
                        });
                    }
                    return res.json({
                        success:true,
                        message:"Login successful!",
                        username: username
                    });
                });
            });

        } catch (error) {
            console.error(error);

            res.status(404).json({
                success: false,
                message: "Internal server error"
            });
        }
    });
    router.get("/me",(req,res) =>{
        if(!req.session.user){
            return res.status(404).json({
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
                return res.status(404).json({
                    succes: false,
                    message: "Logout failed"
                });
            }
            res.clearCookie("diploma_session");

            res.json({
                success:true,
                message: "Logout successful"
            });
        });
    });

    return router;
}