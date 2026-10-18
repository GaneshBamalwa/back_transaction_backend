import {Schema , model} from "mongoose" ; 

const ledgerSchema = new Schema(
    {
        account : 
        {
            type : Schema.Types.ObjectId, 
            ref : "Accounts" , 
            required : [true ,"Account id is required for ledger entry"] , 
            index : true , 
            immuatable : true
        }, 
        amount : 
        {
            type : Number , 
            required : [true ,"amount is required for ledger entry"] , 
            immuatable : true
        }, 
        transaction :
        {
            type : Schema.Types.ObjectId, 
            ref : "transactions" , 
            required : [true , "ledger must be associated witha a transaction"],
            immutable : true,
            index : true , 
        }, 
        type: 
        {
            type : String , 
            enum : 
            {
                values : ["Credited" , "Debited"] , 
                message : "Type can either be credited or debited"
            },
            immutable : true , 
            required : [true , "ledger must be associated with a type of transaction"]
        }
    }
);



const preventLedgerModification = () => {
    throw new Error("Ledger Entries are immutable."); 
}

const blockedQueryOperations = [
  "deleteMany",
  "deleteOne",
  "findOneAndDelete",
  "findOneAndReplace",
  "findOneAndUpdate",
  "replaceOne",
  "updateOne",
  "updateMany",
];

blockedQueryOperations.forEach((operation) => {
  ledgerSchema.pre(operation, preventLedgerModification);
});

const ledger = model("ledger" , ledgerSchema) ; 

export default ledger ; 
