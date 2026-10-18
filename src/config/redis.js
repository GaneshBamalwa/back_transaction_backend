import Redis from "ioredis" ; 

const host = process.env.HOST || "127.0.0.1" ; 
const port = process.env.REDIS_PORT || 6379 ; 


const redisClient = new Redis({host , port}) ;

redisClient.on("connect" , () => console.log("Connected to Redis.")); 
redisClient.on("error" , (err) => console.log(`Error : ${err}`)); 


export default redisClient; 
