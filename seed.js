import mongoose from "mongoose";
import Accounts from "./src/models/accounts.model.js";
import dotenv from "dotenv";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const mongoUri = process.env.MONGO_URI;

const func = async () => {
    if (!mongoUri) {
        throw new Error("MONGO_URI is not defined");
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to the db");

        const sysacc = await Accounts.findOne({ isSystemAccount: true });

        if (sysacc) {
            console.log("Account already exists. Disconnecting...");
            return;
        }

        const newAcc = await Accounts.create({
            user : "6ad36661a46af413c45492e5", 
            balance: 50000,
            isSystemAccount: true
        });

        console.log(`System account created: ${newAcc._id}`);
    } finally {
        await mongoose.disconnect();
    }
};

try {
    await func();
} catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
}