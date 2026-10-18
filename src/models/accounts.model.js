import {Schema, model} from "mongoose";


const accountSchema = new Schema({
    user : {
        type:  Schema.Types.ObjectId,  
        ref : "User" ,  
        index : true 
    } , 
    status : 
    {
        type : String , 
        enum : {
            values: ["active" , "dormant" , "frozen"] , 
            message : "status can be active/dormant/frozen."
        }, 
        default : "active"
    }, 
    accountType : {
        type : String, 
        enum : {
            values : ["savings" , "current" , "business"] ,
            message : "account type can be savings current or business." 
        }, 
        default : "savings" 
    }, 
    balance : {
        type : Number ,
        default : 0
    }, 
    isSystemAccount : {
        type : Boolean , 
        default : false
    }
},
    {
        timestamps : true
    }
);
accountSchema.index({users : 1 , status : 1}) ; 
const Accounts = model("Accounts" , accountSchema) ; 

export default Accounts ; 