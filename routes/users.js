var express 	= require("express"),					// Framework
	router 		= express.Router({mergeParams: true}),	// Route return variable
	passport 	= require("passport");					// User authentication

//var middleware = require("../middleware");
var crypto 		= require("crypto");					// Crypto
var async 		= require("async");						// For resetting password
var nodemailer 	= require("nodemailer"); 				// For resetting password, sending emails

// Models
var	User 		= require("../models/user"),
	Campground 	= require("../models/campground");


// =====================================
// AUTH ROUTES
// =====================================
// Register New User
router.get("/register", function(req, res){
	res.render("users/register", {page: 'register'});
});

// router.post("/register", function(req, res){
// 	var newUser = createNewUser(req);
// 	console.log("newUser from router.post:");
// 	console.log(newUser);
// 	User.register(newUser, req.body.password, function(err, user){
// 		if(err){
// 			// req.flash("error", err.message);
// 			// return res.redirect("/register");
// 			console.log(err);
// 			return res.render("users/register", {error: err.message});
// 		}
// 		console.log("Registration complete. Redirecting to /campgrounds...");
// 		passport.authenticate("local")(req, res, function(){
// 			var flashMsg = "Registration complete. Welcome" + ((user.firstName) ? (" "+user.firstName+"!") : "!");
// 			req.flash("success", flashMsg);
// 			res.redirect("/campgrounds");  
// 		});
// 	});
// });

router.post("/register", function(req, res){
	if(req.body.password!==req.body.confirmPassword){
		req.flash("error", "Passwords do not match!");
		res.redirect("back");
	} else {
		var newUser = createNewUser(req);
		console.log("newUser registration request from router.post:");
		console.log(newUser);
		User.register(newUser, req.body.password, function(err, user){
			if(err){
				// req.flash("error", err.message);
				// return res.redirect("/register");
				console.log(err);
				return res.render("users/register", {error: err.message});
			}
			console.log("Registration complete. Redirecting to /campgrounds...");
			passport.authenticate("local")(req, res, function(){
				var flashMsg = "Registration complete. Welcome" + ((user.firstName) ? (" "+user.firstName+"!") : "!");
				req.flash("success", flashMsg);
				req.logIn(user, function(err){
					if (err) {
						return next(err);
					}
					res.redirect("/campgrounds");  
				});
				
			});
		});
	}
});

// Login
router.get("/login", function(req, res){
	res.render("users/login", {page: "login"});
});

// app.post("/login", middleware, callbackFunction);
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/users/login",
		failureFlash: true,
		successFlash: "You are now logged in! Welcome!"
	}), function(req, res){
});


// Logout
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "You are now logged out!");
	res.redirect("/campgrounds");
});

router.get("/forgot", function(req, res){
	res.render("users/forgot");
});


router.post('/forgot', function(req, res, next) {
	async.waterfall(
	[
		function(done) {
    		crypto.randomBytes(20, function(err, buf) {
    			var token = buf.toString('hex');
        		done(err, token);
      		});
    	},
    	function(token, done) {
			User.findOne({ email: req.body.email }, function(err, user) {
        		if (!user) {
          			req.flash('error', 'No account with that email address exists.');
          			return res.redirect('users/forgot');
        		}
        		user.resetPasswordToken = token;
        		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        		user.save(function(err) {
          			done(err, token, user);
        		});
      		});
    	},
		function(token, user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail', 
				auth: {
				  user: 'samioatsamioco@gmail.com',
				  pass: process.env.EmailPW
				}
			});
			var mailOptions = {
				to: user.email,
				cc: 'samioatsamioco@gmail.com',
				from: 'samioatsamioco@gmail.com',
				subject: 'samio.co password reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
				  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				  'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
				  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				console.log('mail sent');
				req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) {
			return next(err);
		} else {
			res.redirect('/users/login');
		}
	});
});


router.get("/reset/:token", function(req, res){
	User.findOne({
		resetPasswordToken: req.params.token, 
		resetPasswordExpires: { $gt: Date.now()}
	}, {
		username: true,
	}, function(err, foundUser){
		if(err || !foundUser){
			req.flash("error", "Password reset token is invalid or has expired.");
			return res.redirect("back");
		}
		// eval(require('locus'));
		res.render("users/reset", {token: req.params.token, username: foundUser.username});
	});
});

// router.post("/reset/:token", function(req, res){
// 	if(req.body.password!==req.body.confirmPassword){
// 		req.flash("error", "Passwords do not match!");
// 		res.redirect("back");
// 	} else {
// 		//set new password
// 		//authenticate and login		
// 	}
// });

router.post('/reset/:token', function(req, res) {
	async.waterfall(
	[
		function(done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, foundUser) {
				if (err || !foundUser) {
					req.flash('error', 'Password reset token is invalid or has expired.');
				  		return res.redirect('back');
				} else {
					if(req.body.password === req.body.confirmPassword) {
						foundUser.setPassword(req.body.password, function(err) {
							foundUser.resetPasswordToken = undefined;
							foundUser.resetPasswordExpires = undefined;
							foundUser.save(function(err){
								req.logIn(foundUser, function(err) {
									done(err, foundUser);	
								});
							});
						});
					} else {
						req.flash("error", "Passwords do not match.");
					}
				}
			});
		},
		function(foundUser, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail', 
				auth: {
					user: 'samioatsamioco@gmail.com',
					pass: process.env.EmailPW
				}
			});
			var mailOptions = {
				to: foundUser.email,
				from: 'samioatsamioco@mail.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + foundUser.email + ' has just been changed.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				req.flash('success', 'Success! Your password has been changed.');
				done(err);
			});
		}
	], function(err) {
		res.redirect('/campgrounds');
	});
});



// SHOW User Profile
router.get("/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err || !foundUser){
			req.flash("error", "User not found!");
			res.redirect("/campgrounds");
		} else {
			res.render("users/show", {user: foundUser});
		}
	});
});

function createNewUser(req){
	var usernameProper = "";
	var usernameLower = "";
	var firstName= "";
	var lastName = "";
	var email = "";
	// eval(require("locus"));
	if(req.body.username){
		usernameProper = req.body.username[0].toUpperCase() + req.body.username.slice(1).toLowerCase();
		usernameLower = req.body.username.toLowerCase();
		console.log("New user registration request: " + usernameProper);
	}
	if(req.body.newUser.firstName){
		firstName = req.body.newUser.firstName[0].toUpperCase() + req.body.newUser.firstName.slice(1).toLowerCase();
	}
	if(req.body.newUser.lastName){
		lastName = req.body.newUser.lastName[0].toUpperCase() + req.body.newUser.lastName.slice(1).toLowerCase();
	}
	if(req.body.newUser.email){
		email = req.body.newUser.email.toLowerCase();
	}
	
	var newUser = new User({
		username: usernameLower, 
		usernameProper: usernameProper,
		firstName: firstName,
		lastName: lastName,
		email: email,
		avatar: req.body.newUser.avatar
	});
	if(req.body.adminCode==="ADMINCODE"){
		newUser.isAdmin = true;
	}
	console.log("newUser from createNewUser");
	console.log(newUser);
	return newUser;
}


module.exports = router;

