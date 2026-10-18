import {Router} from "express" ; 
import { createAccountController } from "../controllers/account.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router(); 


router.post("/createAccount" ,authMiddleware ,createAccountController); 




export default router; 