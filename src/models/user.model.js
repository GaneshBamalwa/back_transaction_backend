import {Schema, model} from "mongoose";
import bcrypt from  "bcrypt"

const userSchema = new Schema({
    email : {type : String  , required : [true , "Email is required for the user"] , trim: true , lowercase : true , match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"] , unique: [true , "Email already exists."]} , 
    name : {type: String , required : [true , "name is required for the user"]} , 
    password : {type : String , required : [true , "password is required for creating an account"] , minLength :[8 , "password should be of atleast 8 characters"] , select : false}
}, {
    timestamps : true
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const User = model("User" , userSchema) ; 

export default User; 