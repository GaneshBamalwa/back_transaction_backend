import mongoose from "mongoose" ; 
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectToDb = async () => {
    
    const connString = process.env.MONGO_URI; 
    let conn ; 
    conn = await mongoose.connect(connString)
    .then(() => {
        console.log("Successfully connected to db."); 
    }).catch((err) => {
        console.log(err); 
        process.exit(1); 
    }); 
};


export default connectToDb;  