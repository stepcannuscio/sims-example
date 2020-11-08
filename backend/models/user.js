const mongoose = require("mongoose")
const passport = require("passport")
// const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require('bcryptjs')
// mongoose.promise = Promise

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: {
        type: String,
        require: true,
        unique: true,
    },
    password: String,
}, {
    timestamps: true,
})


// user object attaches to the request as req.user
// passport.deserializeUser((id, done) => {
// 	console.log('DeserializeUser called')
// 	User.findOne(
// 		{ _id: id },
// 		'username',
// 		(err, user) => {
// 			console.log('*** Deserialize user, user:')
// 			console.log(user)
// 			console.log('--------------')
// 			done(null, user)
// 		}
// 	)
// })
// Define schema methods
// userSchema.methods = {
// 	checkPassword: function (inputPassword) {
//         console.log('INPUT PASSWORD: ' + inputPassword)
//         console.log('THIS.PASSWORD: ' + this.password)
// 		return bcrypt.compareSync(inputPassword, this.password)
// 	},
// 	hashPassword: plainTextPassword => {
// 		return bcrypt.hashSync(plainTextPassword, 10)
// 	}
// }

// // Define hooks for pre-saving
// userSchema.pre('save', function (next) {
// 	if (!this.password) {
// 		console.log('models/user.model.js =======NO PASSWORD PROVIDED=======')
// 		next()
// 	} else {
// 		console.log('models/user.model.js hashPassword in pre save');
		
// 		this.password = this.hashPassword(this.password)
// 		next()
// 	}
// })




// userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema)
module.exports = User