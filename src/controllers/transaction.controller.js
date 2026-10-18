import mongoose from "mongoose"; 
import Accounts from "../models/accounts.model.js" 
import transactions from "../models/transactions.model.js";
import ledger from "../models/ledger.models.js";


export const transferFunds = async (request , response) => 
{
    
    const { fromAccountId, toAccountId, amount, idempotencyKey } = request.body;
    const idemTransaction  = await transactions.findOne({idempotencyKey : idempotencyKey});
    
    const session = await mongoose.startSession(); 
    session.startTransaction();

    try
    {


        const fromAccount = await Accounts.findById(fromAccountId).session(session) ; 
        const toAccount = await Accounts.findById(toAccountId).session(session) ; 
        
        if(!fromAccount)
        {
            await session.abortTransaction() ; 
            return response.status(400).send("From account invalid");
        }
        if(!toAccount)
        {
            await session.abortTransaction() ; 
            return response.status(400).send("To account invalid");
        }
        if(fromAccount.status !== "active" || toAccount.status !== "active")
        {
            await session.abortTransaction() ; 
            return response.status(400).send("Accounts must be active");
        }
        if(!fromAccount.user.equals(request.user._id))
        {
            await session.abortTransaction() ; 
            return response.status(401).send("Unauthorized transaction."); 
        }
        
        if(!amount || amount <= 0) {
            return response.status(400).send("Amount must be greater than 0");
        }
        


    if(idemTransaction)
    {
        if(idemTransaction.transactionStatus === "Pending")
        {
            return response.status(409).send("Transaction pending, please wait."); 
        }
        else if(idemTransaction.transactionStatus === "Failed")
        {
            return response.status(409).send("Transaction already failed, please initiate a new transaction.");
        }
        else if(idemTransaction.transactionStatus === "Reversed")
        {
            return response.status(409).send("Transaction reversed by the server, please initiate a new transaction.");
        }
        else
        {
            return response.status(409).send("Transaction completed.");
        }
    }

        
        if(fromAccount.balance < amount)
        {
            await session.abortTransaction() ; 
            return response.status(400).send(`Insufficient Balance. Current Balance = ${fromAccount.balance} , Requested Transfer Amount : ${amount}`); 
        }



        //Transactional changes 

        fromAccount.balance -= amount ; 
        toAccount.balance += amount ;
        
        //save these changes to mongoDb
        await fromAccount.save({session}) ; 
        await toAccount.save({session}) ; 


        //create transaction record. 

        const newTransaction = await transactions.create([{
            fromAccount : fromAccountId , 
            toAccount : toAccountId , 
            transactionStatus : "Completed", 
            amount : amount , 
            idempotencyKey : idempotencyKey 
        }] , {session}); 


        const ledgerEntryFromAcc = {
            account : fromAccountId , 
            amount : amount , 
            transaction  : newTransaction[0]._id , 
            type : "Debited" 
        }

        
        const ledgerEntryToAcc = {
            account : toAccountId , 
            amount : amount , 
            transaction  : newTransaction[0]._id , 
            type : "Credited" 
        }

        await ledger.insertMany([ledgerEntryFromAcc , ledgerEntryToAcc] , {session});


        await session.commitTransaction();
        return response.status(201).send({ transaction: newTransaction[0] });
    }catch(error)
    {
        await session.abortTransaction() ; 
        return response.status(500).send(`Error : ${error}`) ; 
    }finally{
        session.endSession() ; 
    }
    


}; 




export const getTransactionHistory = async (request, response) => {

    const accountId = request.params.accountId; 
    
    try
    {
        const account = await Accounts.findById(accountId); 
        if(!account || !account.user.equals(request.user._id)) {
        return response.status(403).send("Unauthorized access. not middleware");
        }


    const transactionDetails = await ledger.find({account : accountId}).populate("transaction") ; 
    return response.status(200).send(transactionDetails) ; 

    }catch(error)
    {
        console.log(error) ;
        return response.status(500).send("Failed to fetch.") ;
    }
    
}; 