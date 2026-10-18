import Accounts from "../models/accounts.model.js";

export const createAccountController = async (request, response) => {
    try {
        const user = request.user;
        console.log(user) ; 
        const account = await Accounts.create({
            user: user.id
        });

        return response.status(201).send({
            message: "Account created successfully.",
            account
        });
    } catch (error) {
        console.log(error) ; 
        return response.status(500).send({
            message: "Failed to create account."
        });
    }
};