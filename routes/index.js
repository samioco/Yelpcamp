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


// router.get("/", function(req, res){
//     res.send("Is this thing on?");
// });

// router.get("/", async function(req, res){
// 	let post = await Post.create({
// 		title: 'Test',
// 		description: 'This is a test'
// 	});
//     res.send(post);
// });


module.exports = router;
