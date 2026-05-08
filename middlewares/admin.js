require("dotenv").config();
const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {
     const token =  req.headers.token ;
        if(!token){
        return res.status(401).json({
            success : false,
            message : "ACCESS_DENIED"
        })
    }
     
    try{
        const tokenCompare =  jwt.verify(token,process.env.ADMIN_TOKEN);
        if(!tokenCompare){
            return res.status(401).json({
                success : false,
                message : "TOKEN_NOT_FOUND"
            })
        } 
        req.creator = tokenCompare.id ;
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
    adminMiddleware : adminMiddleware
}