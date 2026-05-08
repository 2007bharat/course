require("dotenv").config();
const express = require("express");
const { Router } = express;
const bcrypt = require("bcrypt")
const { z, success } = require("zod")
const jwt=   require("jsonwebtoken")

const adminRouter = Router();
const { userModel, adminModel, courseModel } = require("../db");
const { adminMiddleware } = require("../middlewares/admin");
adminRouter.post("/signUp", async (req, res) => {

    const { username, email, password } = req.body;
    console.log(req.body)


    const adminSchema = z.object({
        username: z.string().min(6).max(16),
        email: z.string().email("INVALID_EMAIL").min(6).max(160),
        password: z.string().min(8).max(100).regex(/[A-Z]/, "Ek uppercase letter zaruri hai")
            .regex(/[a-z]/, "Ek lowercase letter zaruri hai")
            .regex(/[0-9]/, "Ek number zaruri hai")
        // .regex(/[@$!%*?&]/, "Ek special character zaruri hai")
    })
    const dataZodChecker = adminSchema.safeParse(req.body);

    if (!dataZodChecker.success) {
        return res.status(400).json({
            message: false,
            error: dataZodChecker.error,
        })
    }
    try {
        const hashPass = await bcrypt.hash(password, 12);

        const chekcer = await adminModel.create({
            username: username,
            email: email,
            password: hashPass
        })
        console.log(chekcer)

        res.json({
            success: dataZodChecker.success,
            message: "ACCOUNT_CREATE_SUCCESSFUL",
            data: dataZodChecker.data

        })
    }

    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "EMAIL_ALREADY_EXIST",

            })

        }
            res.status(500).json({
                success: false,
                message: "INTERNAL_SERVER_PROBLEM"
            })


    }
})

adminRouter.post("/signIn", async function (req, res) {
    const { email, password } = req.body;
    console.log(req.body)
    const adminSchema = z.object({
        email: z.string().email("INVALID_EMAIL").min(6).max(160),
        password: z.string().min(8).max(100).regex(/[A-Z]/, "Ek uppercase letter zaruri hai")
            .regex(/[a-z]/, "Ek lowercase letter zaruri hai")
            .regex(/[0-9]/, "Ek number zaruri hai")
        // .regex(/[@$!%*?&]/, "Ek special character zaruri hai")
    })
    const dataZodChecker = adminSchema.safeParse(req.body);
    console.log(dataZodChecker)

    if (!dataZodChecker.success) {
        return res.status(400).json({
            message: false,
            error: dataZodChecker.error,
        })
    }
    try {
        const userFinder = await adminModel.findOne({
            email: email
        })
        console.log("userFinder-----",userFinder)
        if (!userFinder) {
            return res.status(404).json({
                success: false,
                message: "EMAIl_NOT_EXIST"
            })
        }
        const checkpass = await bcrypt.compare(password,userFinder.password);
        console.log(!checkpass)
        
        console.log("hi")
        if(!checkpass){
            res.status(401).json({
                success : false ,
                message :  "INVALID_PASSWORD"
            })
    }
        const tokenGenrator =  jwt.sign({ id : userFinder._id},
            process.env.ADMIN_TOKEN,{expiresIn : "10m"}
        )
        console.log(tokenGenrator)
        console.log(process.env.ADMIN_TOKEN)
        res.status(200).json({
            success: true,
            message : "LOGIN_GRANTED!!",
            token: tokenGenrator
        })
        
    
    } catch (err) {
        if(err){
            return res.json({
                message :  {"error-name": err.message }
            })
        }
        res.status(500).json({
            success :false,
            message : "INTERNAL_SERVER_PROBLEM"
        })
    }
})

adminRouter.post("/create-course",adminMiddleware,async function(req,res){
    const {price , img , title , description }  = req.body;
    const adminSchema = z.object({
        price : z.number().min(3).max(10000),
        img :  z.string().min(10).max(10000),
        title : z.string().min(5).max(100),
        description : z.string().min(10).max(1000)
    })
    const dataZodChecker = adminSchema.safeParse(req.body); 
    if(!dataZodChecker.success){
        return res.status(400).json({
            success : false,
            message : dataZodChecker.error
        })
    }
    try{
        const creatorId = req.creator;
        const courseCreate =  await courseModel.create({
            price : price,
            img : img,
            title : title,  
            description : description,
        
            creatorId : creatorId
        })
        res.status(201).json({
            success: true,
            message: "COURSE_CREATED_SUCCESSFULLY",
            course: courseCreate
        })
    }catch(err){
        res.status(500).json({
            success : false,
            message : "INTERNAL_SERVER_PROBLEM"     
            })
    }
})
adminRouter.put("update-course/:courseId", adminMiddleware , async (req,res)=>{
    const {courseId } = req.params;
    const creatorId = req.creator;
    console.log(courseId,creatorId)
    const adminSchema = z.object({
        courseId : z.string().min(5).max(100)
    })
    const dataZodChecker = adminSchema.safeParse(req.params); 
    if(!dataZodChecker.success){
        return res.status(400).json({
            success : false,
            message : dataZodChecker.error
        })
    }
    try{
        const courseCreate =  await courseModel.updateOne({
            _id : courseId,
            creatorId : creatorId
        },{ $set : {
            price : price,  
            img : img,
            title : title,  
            description : description,
        }})
        res.status(201).json({
            success: true,
            message: "COURSE_UPDATED_SUCCESSFULLY",
            course: courseCreate
        })
    }catch(err){
        res.status(500).json({
            success : false,
            message : "INTERNAL_SERVER_PROBLEM"     
            })
    }
})


adminRouter.delete("/delete-course/:courseId",async function(req,res){
     const {courseId }  = req.params;
    const adminSchema = z.object({
         courseId : z.string().min(5).max(100)
    })
    const dataZodChecker = adminSchema.safeParse(req.params); 
    if(!dataZodChecker.success){
        return res.status(400).json({
            success : false,
            message : dataZodChecker.error
        })
    }
    try{
        if(!tokenCompare){
            return res.status(401).json({
                success : false,
                message : "TOKEN_NOT_FOUND"
            })
        } 
        const creatorId = req.creator;
        const courseCreate =  await courseModel.findByIdAndDelete(courseId);

        if(!courseCreate){
            return res.status(404).json({
                success : false,
                message : "COURSE_NOT_FOUND"
            })
        }
        res.status(201).json({
            success: true,
            message: "COURSE_DELETED_SUCCESSFULLY",
            courses: courseCreate
        })
    }catch(err){
        if(err.name === "JsonWebTokenError"){
            return res.status(401).json({
                success : false,
                message : "TOKEN_MODIFIED"
            })
        }

        if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                success : false,
                message : "TOKEN_EXPIRED"
            })
        }
    }
})

adminRouter.get("/creator-allCourses/",async function(req,res){

    const creatorId   = req.creator;
    const adminSchema = z.object({
        creatorId : z.string().min(5).max(100)
    })
    const dataZodChecker = adminSchema.safeParse({ creatorId: creatorId }); 
    if(!dataZodChecker.success){
        return res.status(400).json({
            success : false,
            message : dataZodChecker.error
        })
    }
    try{
        const courseCreate =  await courseModel.find({ creatorId: creatorId });

        if(!courseCreate){
            return res.status(404).json({
                success : false,
                message : "CREATOR_NOT_FOUND"
            })
        }
        res.status(201).json({
            success: true,
            message: "COURSE_FETCHED_SUCCESSFULLY",
            courses: courseCreate
        })
    }catch(err){
            res.status(500).json({
                success : false,
                message : "INTERNAL_SERVER_PROBLEM"     
            })
    }
})  



module.exports = {
    adminRouter: adminRouter
}


courseModel.update