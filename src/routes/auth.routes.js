import {Router} from "express";
import {userRegisterController,userLoginController, logoutUser} from "../controllers/auth.controllers.js"
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router() ; 


/*Register Route*/

router.post("/register",userRegisterController); 

/*Login Route*/
router.post("/login",userLoginController); 


router.post("/logout", authMiddleware , logoutUser);  


export default router ; 
