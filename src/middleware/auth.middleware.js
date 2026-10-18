import User from "../models/user.model.js" ; 
import jwt from "jsonwebtoken" ; 
import cookieParser from "cookie-parser";
import dotenv from "dotenv" ; 
import redisClient from "../config/redis.js";

export const authMiddleware = async (request , response , next) =>{

    const {token} = request.cookies;

    if(!token)
    {
        return response.status(401).send("Please login or register first.") ; 
    }
    try
    {
        const isBlacklisted = await redisClient.get(token) ; 
        if(isBlacklisted)
        {
            return response.status(401).send("Token Blacklisted.") ;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        const userData = await User.findById(decoded.id);
        if(!userData)
            {
                return response.status(401).send("Invalid Credentials") ;
            } 
        //console.log(`middleware data \n: ${userData}`) ;  
        request.user = userData ; 
        return next(); 
        
    }catch(err)
    {
        console.log(err) ;
        return response.status(500).send("Internal Server Error.") ; 
    }
}; 
