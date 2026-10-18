import express from "express" ; 
import mongoose from "mongoose" ; 
import authRouter from "./routes/auth.routes.js" ; 
import accRouter from "./routes/accounts.routes.js" ;
import transactionRouter from "./routes/transactions.routes.js";  
import cookieParser from "cookie-parser";

const app = express() ; 
app.use(express.json()) ;
app.use(cookieParser()) ; 
app.use("/auth/" , authRouter); 
app.use("/account/" , accRouter); 
app.use("/transactions" , transactionRouter); 




app.get("/" , (request , response) => {

    return response.send("Hello World"); 
}) ; 



export default app ; 