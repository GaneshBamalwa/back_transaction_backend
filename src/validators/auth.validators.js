import {z} from "zod" ; 


export const registerSchema = z.object({
    email : z.string({required_error : "Email is required."}).trim().toLowerCase().email("Invalid email format"), 
    name : z.string({required_error : "Name is required."}).trim().min(2) ,
    password : z.string({required_error : "password is required."}).trim().min(8, "password must be 8 characters"),
});



export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email format"),
    password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password cannot be empty"),
});