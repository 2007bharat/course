require("dotenv").config();
const jwt = require("jsonwebtoken");

function userMiddleware(req,res,next){ 
    const token =  req.headers.token ;
            if(!token){
            return res.status(401).json({
                success : false,
                message : "ACCESS_DENIED"
            })
        }
         
        try{
            const tokenCompare =  jwt.verify(token,process.env.USER_TOKEN);
            if(!tokenCompare){
                return res.status(401).json({
                    success : false,
                    message : "TOKEN_NOT_FOUND"
                })
            } 
            req.user = tokenCompare.id ;
            next();
           
           
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
    }
    
    

module.exports={
    userMiddleware : userMiddleware
}