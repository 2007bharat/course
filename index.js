const express =  require("express");
const { userRouter , adminRouter , purchaseRouter  }  =  require("./routes/user");

const app = express();
app.use(express.json())
app.use("/api/v1/user/signUp",userRouter)
app.use("/api/v1/user/signUp",adminRouter)
app.use("/api/v1/user/signUp",purchaseRouter)

app.listen(3000,()=>{
    console.log("server Started")
})