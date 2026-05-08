const express = require("express");
const { Router } = express;
const { z, success } = require("zod");
const { userMiddleware } = require("../middlewares/user")
const bcrypt = require("bcrypt")
const jwt  =  require("jsonwebtoken")
const userRouter = Router();
const { userModel, purchaseModel, courseModel } = require("../db")

userRouter.post("/signUp", async (req, res) => {

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

        const chekcer = await userModel.create({
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

userRouter.post("/signIn", async function (req, res) {
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
        const userFinder = await userModel.findOne({
            email: email
        })
        console.log("userFinder-----",userFinder)
        if (!userFinder) {
            return res.status(404).json({
                success: false,
                message: "EMAIl_NOT_EXIST"
            })
        }
        const checkpass = await bcrypt.compare(password, userFinder.password);
        // console.log(!checkpass)

        console.log(checkpass)
        if (!checkpass) {
            res.status(401).json({
                success: false,
                message: "INVALID_PASSWORD"
            })
        }
        const tokenGenrator = jwt.sign({ id: userFinder._id },
            process.env.USER_TOKEN, { expiresIn: "10m" }
        )
        console.log(tokenGenrator)
        res.status(200).json({
            success: true,
            message: "LOGIN_GRANTED!!",
            token: tokenGenrator
        })


    } catch (err) {
        if (err) {
            return res.json({
                message: { "error-name": err.message }
            })
        }
        res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_PROBLEM"
        })
    }
})
    userRouter.get("/purchased",userMiddleware,async function(req,res){
        const userid = req.user;
        try{
            const purchaseCourseaShow =  await purchaseModel.find({userId : userid}).populate("courseId");
            if(purchaseCourseaShow.length === 0){
                return res.status(404).json({
                    success : false,
                    message : "NO_COURSE_PURCHASED"
                })
            }   
            res.status(200).json({
                success : true,
                message : "COURSE_PURCHASED_LIST",
                purchaseCourseaShow : purchaseCourseaShow
            })

        }catch(err){
            res.status(500).json({
                success : false,
                message : "INTERNAL_SERVER_PROBLEM"
            })  

        }
})


userRouter.get("/show-courses", async function(req,res){
    try{
        const showCourse = await courseModel.find();  
        if(showCourse.length === 0){
            return res.status(404).json({
                success : false,    
                message : "NO_COURSE_FOUND"
            })
        }   
        res.status(200).json({
            success : true,
            message : "COURSE_LIST",
            showCourse : showCourse
        })  
    }catch(err){
        res.status(500).json({
            success : false,
            message : "INTERNAL_SERVER_PROBLEM",
            error : err.message
        })  
    }   
        
})  







    module.exports = {

        userRouter: userRouter
    }