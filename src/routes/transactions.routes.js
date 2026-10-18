import {Router} from "express" ; 
import {getTransactionHistory , transferFunds } from "../controllers/transaction.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router() ; 


router.get("/getTransactionHistory/:accountId" , authMiddleware , getTransactionHistory) ;


router.post("/transferFunds" , authMiddleware , transferFunds) ; 

export default router ; 