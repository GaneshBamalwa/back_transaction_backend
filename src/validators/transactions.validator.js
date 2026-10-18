import {z} from "zod" ; 

const objectIdRegex = /^[0-9a-fA-F]{24}$/;



export const transferFundsSchema = z.object({
    fromAccountId : z.string({ required_error: "fromAccountId is required" }).regex(objectIdRegex , "Invalid fromAccountId format"), 
    toAccountId: z.string({ required_error: "toAccountId is required" }).regex(objectIdRegex , "Invalid toAccountId format"), 
    amount : z.number().positive("transfer amount must be positive").gt(0 , "transfer amount must be greater than 0") , 
    idempotencyKey : z.string({ required_error: "Idempotency key is required" }).min(1, "Idempotency key cannot be empty"),


}).refine(
    (data) => data.toAccountId !== data.fromAccountId , 
    {message : "cannot transfer fund to the same account" , 
        path : ["toAccountId"]
});