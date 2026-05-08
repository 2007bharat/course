require("dotenv").config();
const express =  require("express");
const { userRouter }  =  require("./routes/user");
const { adminRouter }  = require("./routes/admin");
const { default: mongoose } = require("mongoose");
const cors = require("cors");


const app = express();
// app.use(cors({  
//     origin : "*"
// }))
app.use(express.json())
app.use("/api/v1/user/",userRouter)
app.use("/api/v1/admin/",adminRouter)
// app.use("/api/v1/user/",purchaseRouter)
async function connectDB(){
    
        await mongoose.connect(process.env.DB_LINK).then(()=>{
            console.log("DB Connected")
        }).catch((err)=>{
            console.log("DB Connection Failed")
        })
        
app.listen(3000,()=>{
    console.log("server Started")
})
}
connectDB();
