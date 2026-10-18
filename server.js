import app from "./src/app.js" ; 
import dotenv from "dotenv" ; 
import connectToDb from "./src/config/db.js"


dotenv.config(); 
const PORT = process.env.PORT; 

connectToDb(); 
app.listen(PORT , () => {
    console.log(`App Listening on Port ${PORT}`) ; 
}); 