import userModel from "../models/userModel.mjs";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import config from "../../config.mjs";
import { validateEmail,validatePassword,validatePhone } from "../utils/valid.mjs";
const registerUser= async (req,res)=>{
    try {
         let {title, name, phone, email, password, address } = req.body;
         // Validate user input
         if (!validateEmail(email)) {
             return res.status(400).send({ message: "failed", error: "Invalid email format" });
         }
         if (!validatePassword(password)) {
             return res.status(400).send({ message: "failed", error: "Need strong password which includes uppercase, lowercase, number and special character" });
         }
         if (!validatePhone(phone)) {
             return res.status(400).send({ message: "failed", error: "Phone number must be 10 digits long" });
         }

         // Hash password
         const salt = await bcrypt.genSalt(10);
         password = await bcrypt.hash(password, salt);
         // Check for duplicate user
         const existingUser = await userModel.findOne({ email });
         if (existingUser) {
             return res.status(400).send({ message: "failed", error: "Email already exists" });
         }
         // Create new user
         const newUser = await userModel.create({title, name, phone, email, password, address });
         return res.status(201).send({ message: "success", data: newUser });
    } catch (error) {
        if(error.message.includes('validation')){
            return res.status(400).send({ message:"failed",error: error.message });
        }else if(error.message.includes('duplicate')){
            return res.status(400).send({ message:"failed",error: error.message });
        }else{
            return res.status(500).send({ message:"failed",error: "Internal Server Error" });
        }
    }
}
const login=async (req,res)=>{  
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "failed", error: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: "failed", error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id,email: user.email }, config.secretToken);
        if(!token){
            return res.status(500).send({ message: "failed", error: "Internal Server Error" });
        }
        res.setHeader("Authorization", `Bearer ${token}`);
        return res.status(200).send({ message: "success", data: user});
    } catch (error) {
        return res.status(500).send({ message: "failed", error: "Internal Server Error" });
    }
}
export {registerUser,login};