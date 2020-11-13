const User = require("../models/user.js")
const passport = require("passport")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const uri = process.env.ATLAS_URI
mongoose.connect("mongodb+srv://burmAdmin:7mxzGNAG2PZmPQsV@freecluster.hefln.mongodb.net/testDB?retryWrites=true&w=majority", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })


// passport.use(User.createStrategy());

const user = new User({
  firstName: "Marty",
  lastName: "Burman",
  email: "marty@burmanshealthshop.com",
  username: "mburman",
  password: "baseball69"
})

  User.findOne({username: user.username}, async (err, document) => {
      if (err) throw err;
      if (document) console.log("User already exists")
      if (!document) {
          const hashedPassword = await bcrypt.hash(user.password, 10)
          const newUser = new User({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            password: hashedPassword
          })
          await newUser.save()
          console.log("User created")
      }
  })


// User.register({username: user.username, firstName: user.firstName, lastName: user.lastName, email: user.email}, user.password, function(err, user){

//     if (err) {
//       console.log(err);
//     } else {
//         console.log("Created user: ")
//         console.log(user)
//     }
//   });


// router.post("/register", (req, res) => {
//   console.log(req.body)
//   User.findOne({username: req.body.username}, async (err, document) => {
//       if (err) throw err;
//       if (document) res.send("User already exists")
//       if (!document) {
//           const hashedPassword = await bcrypt.hash(req.body.password, 10)
//           const newUser = new User({
//               username: req.body.username,
//               password: hashedPassword
//           })
//           await newUser.save()
//           res.send("User created")
//       }
//   })
// })