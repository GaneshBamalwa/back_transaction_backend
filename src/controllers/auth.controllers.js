import User from "../models/user.model.js" ; 
import mongoose from "mongoose";
import jwt from "jsonwebtoken" ; 
import dotenv from "dotenv"; 
import redisClient from "../config/redis.js";





export const userLoginController = async (request , response) =>{

    const {email , password} = request.body; 

    try
    {
        const emailExists = await User.findOne({email}).select("+password");
        if(!emailExists)
        {
            return response.status(404).send("User not found") ; 
        }
        if(!emailExists.comparePassword(password)) 
        {
            return response.status(401).send("Invalid Password"); 
        } 
        const token = jwt.sign( {id: emailExists._id} , process.env.JWT_SECRET , {expiresIn : "1d"}) ; 
        response.cookie("token" , token) ; 
        return response.status(200).send({id : emailExists._id , email : emailExists.email , name : emailExists.name}) ; 
    }catch(err)
    {
            return response.status(500).send("Internal Server Error."); 
    }
}; 



export const userRegisterController = async (request , response) =>
{
    const {email ,name,password} = request.body; 

    try
    {
        const emailExists = await User.findOne({email}) ;
        if(emailExists)
        {
            return response.status(409).send("Email already exists....") ; 
        }
        const user = await User.create({
            email , name , password
        });
        const token = jwt.sign( {id: user._id} , process.env.JWT_SECRET , {expiresIn : "1d"}) ; 
        response.cookie("token" , token) ; 
        return response.status(201).send({id : user._id , email : user.email , name : user.name}) ; 
    }catch(err)
    {
            return response.status(500).send("Internal Server Error."); 
    }
};



export const logoutUser = async (request , response) => 
{
    const {token}  = request.cookies; 

    const decoded = jwt.decode(token); 
    
    const exp = decoded.exp ; 
    
    const remaining = exp - Math.floor(Date.now() / 1000) ; 
    
    await redisClient.set(token , "blacklist" , "EX" , remaining); 

    response.clearCookie("token"); 

    return response.status(200).send("Logged out successfully.")


}; 