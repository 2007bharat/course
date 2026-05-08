const mongoose =  require("mongoose");
const {Schema} = mongoose;
const { ObjectId }  = mongoose.Schema.Types;

const userSchema =  new Schema({
    username :  String,
    email : {type  : String , unique : true},
    password :  String
})
const adminSchema =  new Schema({
    username :  String,
    email : {type  : String , unique : true},
    password :  String
})

const purchaseSchema = new Schema({
    courseId :  {type :  ObjectId , ref : "Course"},
    userId :  {type :  ObjectId , ref : "User"}
})

const courseSchema =  new Schema({
    creatorId :  {type :  ObjectId , ref : "Admin"},
    price : String,
    img :  String,
    title   :String,
    description : String

})


const userModel  =  mongoose.model("User", userSchema)
const adminModel  =  mongoose.model("admin", adminSchema)
const puchaseModel  =  mongoose.model("purchase", purchaseSchema)
const courseModel  =  mongoose.model("Course", courseSchema)

module.exports = {
    userModel,
    adminModel,
    puchaseModel,
    courseModel
    
}