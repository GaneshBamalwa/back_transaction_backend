import {Router} from "express";
import {userRegisterController,userLoginController} from "../controllers/auth.controllers.js"

const router = Router() ; 


/*Register Route*/

router.post("/register",userRegisterController); 

/*Login Route*/
router.post("/login",userLoginController); 


export default router ; 
