const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {blogmodel} = require("./models/blog")

const app =express()
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb+srv://biji2002:bijivembilitteera@cluster0.jbhk9yb.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0")


const generateHashedPassword = async (password) => {
   const salt = await bcrypt.genSalt(10) 
   return bcrypt.hash(password,salt)
}

app.post("/signUp",async (req,res)=>{

    let input = req.body
    let hashedPassword = await generateHashedPassword(input.password)
    console.log(hashedPassword)
    input.password = hashedPassword
    let blog = new blogmodel(input)
    blog.save()
    res.json({"status":"success"})
})

app.post("/signin",(req,res)=>{
   let input = req.body
   blogmodel.find({"emailId":req.body.emailId}).then(
    (response)=>{
       if (response.length>0) {
          let dbPassword = response[0].password
          console.log(dbPassword)
          bcrypt.compare(input.password,dbPassword,(error,isMatch)=>{
            if (isMatch) {
                jwt.sign({email:input.emailId},"blog-app",{expiresIn:"1d"},
                    (error,token)=>{
                        if(error){
                            res.json({"status":"unable to create token"})
                        }else{
                            res.json({"status":"success","userid":response[0]._id,"token":token})
                        }
                    }
                )
            
            } else {
                res.json({"status":"incorrect"})
            }
          })   

       }else {
        res.json({"status":"user not found"})
       }
    }
   ).catch()

})
app.listen(8081,()=>{
    console.log("server running")
})