const express = require("express");
const { Router } = express;
const { z, success } = require("zod")

const userRouter = Router();
const { userModel} =  require("../db")

userRouter.post("/signUp", async (req, res) => {
      const {username  , email , password} = req.body;
       
        
    const userschema = z.object({
        username: z.string().min(6).max(16),
        email: z.string().email("INVALID_EMAIL").min(6).max(160),
        password: z.string().min(8).max(100).regex(/[A-Z]/, "Ek uppercase letter zaruri hai")
            .regex(/[a-z]/, "Ek lowercase letter zaruri hai")
            .regex(/[0-9]/, "Ek number zaruri hai")
            // .regex(/[@$!%*?&]/, "Ek special character zaruri hai")
    })
    const dataZodChecker = userschema.safeParse(req.body);

    if(!dataZodChecker.success){
           return res.status(400).json({
                message  : false ,
                error : dataZodChecker.error,
            })
        }

    try{
            await userModel.create({
                username :  username ,
                email :  email,
                password  :  password
            })
            res.json({
                success : dataZodChecker.success,
                message : "ACCOUNT_CREATE_SUCCESSFUL",
                data : dataZodChecker.data
            
            })
        }

    catch(err){
        if(err.code === 11000){ 
            return res.status(400).json({
                success : false,
                message :  "EMAIL_ALREADY_EXIST",
            
            })

            res.status(500).json({
                success : false , 
                message : "INTERNAL_SERVER_PROBLEM"
            })
        }
    }
  
})






module.exports= {

    userRouter :  userRouter
}