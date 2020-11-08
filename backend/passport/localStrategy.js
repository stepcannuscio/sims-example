
const User = require('../database/models/user.model')
const LocalStrategy = require('passport-local').Strategy

const strategy = new LocalStrategy(

	function(username, password, done) {
        console.log("USERNAME: " + username)
        console.log("PASSWORD: " + password)
		User.findOne({ username: username }, (err, user) => {
			if (err) {
                // console.log("111111 ERRRRRRRROORRRRR 1111111")
				return done(err)
			}
			if (!user) {
				return done(null, false, { message: 'Incorrect username' })
			}
			if (!user.checkPassword(password)) {
				return done(null, false, { message: 'Incorrect password' })
			}
			return done(null, user)
		})
	}
)

module.exports = strategy