var express 	= require("express"),		// Framework
	router 		= express.Router(),			// Route return variable
	passport 	= require("passport");		// User authentication

var crypto 		= require("crypto");		// Crypto
var async 		= require("async");			// For resetting password
var nodemailer 	= require("nodemailer"); 	// For resetting password, sending emails

// Models
var	User 		= require("../models/user"),
	Campground 	= require("../models/campground");

router.get("/", function(req, res){
    res.render("index");
});



module.exports = router;
