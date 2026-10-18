import {Schema, model} from "mongoose";


const transactionSchema = new Schema({
    toAccount : {
        type :Schema.Types.ObjectId,
        ref : "Accounts", 
        required : [true , "Transaction must be associated with a to Account"], 
        index : true 
    },
    fromAccount : {
        type :Schema.Types.ObjectId,
        ref : "Accounts", 
        required : [true , "Transaction must be associated with a from Account"], 
        index : true 
    }, 
    transactionStatus :
    {
        type : String , 
        enum : 
        {
            values : ["Pending" , "Completed" , "Failed" , "Reversed"],
            message : "Status must be pending completed failed or reversed" 
        }, 
        default: "Pending" 
    }, 
    amount : 
    {
        type : Number , 
        required: [true , "Amount is required to process a trnasaction"]
    }, 
    idempotencyKey : 
    {
        type: String, 
        required : [true , "Idempotency key is needed to initiate a transaction"], 
        unique : true, 
        index : true
    }
}, {
    timestamps : true
}); 


const transactions = model("transactions" , transactionSchema) ; 


export default transactions ; 