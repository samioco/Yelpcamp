var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};


// module.exports = {
// 	checkCampgroundOwnership: function(req, res, next){
// 		if(req.isAuthenticated()){
// 			Campground.findById(req.params.id, function(err, foundCampground){
// 				if(err){
// 					res.redirect("back");
// 				} else {
// 					if(foundCampground.author.id.equals(req.user._id)){
// 						next();
// 					} else {
// 						res.redirect("back");
// 					}
// 				}
// 			});
// 		} else {
// 			res.redirect("back");
// 		}	
// 	},
// 	checkCampgroundOwnership: function(req, res, next){
// 		if(req.isAuthenticated()){
// 			Campground.findById(req.params.id, function(err, foundCampground){
// 				if(err){
// 					res.redirect("back");
// 				} else {
// 					if(foundCampground.author.id.equals(req.user._id)){
// 						next();
// 					} else {
// 						res.redirect("back");
// 					}
// 				}
// 			});
// 		} else {
// 			res.redirect("back");
// 		}
// 	},
// 	isLoggedIn: function(req, res, next){
// 		if(req.isAuthenticated()){
// 			return next();
// 		}
// 		res.redirect("/login");
// 	}
// }

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Campground not found!");
				res.redirect("back");
			} else if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
				req.campground = foundCampground;
				next();
			} else {
				req.flash("error", "You don't have permission to do that!");
				res.redirect("back");
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!")
		res.redirect("back");
	}
}


middlewareObj.checkCommentOwnerShip = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.commentId, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found!");
				res.redirect("back");
			} else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
				req.comment = foundComment;
				next();
			} else {
				req.flash("error", "You don't have permission to do that!");
				res.redirect("back");
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that!")
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/users/login");
}
module.exports = middlewareObj;



