var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	usernameProper: String,
	password: String,
	firstName: String,
	lastName: String,
	email: {type: String, unique: true, required: true},
	avatar: String,
	isAdmin: {type: Boolean, default: false},
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

// var options = {
// 	errorMessages: {
// 		IncorrectPasswordError: "Incorrect password",
// 		IncorrectUsernameError: "Incorrect username"
// 	}
// };


UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
