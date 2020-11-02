const User = require("../models/user.model.js")
const passport = require("passport")
const mongoose = require("mongoose")
require("dotenv").config()

const uri = process.env.ATLAS_URI
mongoose.connect("mongodb+srv://burmAdmin:7mxzGNAG2PZmPQsV@freecluster.hefln.mongodb.net/testDB?retryWrites=true&w=majority", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })


passport.use(User.createStrategy());

const user = new User({
  firstName: "admiral",
  lastName: "savage",
  username: "admin",
  password: "baseball69"
})

User.register({username: user.username, firstName: user.firstName, lastName: user.lastName}, user.password, function(err, user){

    if (err) {
      console.log(err);
    } else {
        console.log("Created user: ")
        console.log(user)
    }
  });