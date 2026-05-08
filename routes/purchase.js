require("dotenv").config();
const express = require("express");
const { Router } = express;
const bcrypt = require("bcrypt")
const { z, success } = require("zod")
const jwt=   require("jsonwebtoken")

const purchaseRouter = Router();
const { userModel, adminModel, courseModel , purchaseModel } = require("../db");
const { userMiddleware } = require("../middlewares/user");



purchaseRouter.post("/course/:courseId", userMiddleware, async function (req, res) {
    const { courseId } = req.params;
    const userId = req.user;

    const adminSchema = z.object({
        courseId: z.string().min(5).max(100)
    })
    const dataZodChecker = adminSchema.safeParse(req.params);
    if (!dataZodChecker.success) {
        return res.status(400).json({
            success: dataZodChecker.success,
            message: dataZodChecker.error
        })
    }
    const findCourse = await courseModel.findById(courseId);
    if (!findCourse) {
        return res.status(404).json({
            success: false,
            message: "COURSE_NOT_FOUND"
        })
    }
    try{
        const alreadyPurchased = await purchaseModel.findOne({
            userId: userId,
            courseId: courseId
        })
        if(alreadyPurchased){
            return res.status(400).json({
                success: false,
                message: "COURSE_ALREADY_PURCHASED"
            })
        }

        const purchaseCourse = await purchaseModel.create({
            userId: userId,
            courseId: courseId
        })
        if(!purchaseCourse){
            return res.status(400).json({
                success: false,
                message: "COURSE_PURCHASE_FAILED"
            })
        }
        res.status(201).json({
            success: true,
            message: "COURSE_PURCHASED_SUCCESSFULLY",
            purchase: purchaseCourse
        })



    }catch(err){
        res.status(500).json({
            success : false,
            message : "INTERNAL_SERVER_PROBLEM",
            message : err.message
        })  
    }




})


module.exports = {
    purchaseRouter: purchaseRouter      
}