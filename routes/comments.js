var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
	// find campground by id, send to comment form
	//console.log(req.params.id);
	Campground.findOne({slug: req.params.slug}, function(err, campground){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

// CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
	Campground.findOne({slug: req.params.slug}, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			//console.log(req.body.comment);
			//create new comment
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash("error", "Something went wrong!");
					console.log(err);
				} else {
					//add username/id to comment, then save
					comment.author.id = req.user.id;
					comment.author.username = req.user.username;
					comment.author.firstName = req.user.firstName;
					comment.author.lastName = req.user.lastName;
					comment.save();
					//connect new comment to campground
					//redirect to campground show page
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Thank you for leaving a comment!");
					res.redirect("/campgrounds/" + campground.slug);
				}
			});
		}
	});
});

// EDIT Comment
// router.get("/:commentId/edit", middleware.checkCommentOwnerShip, function(req, res){
// 	res.render("comments/edit", {campgroundSlug: req.params.slug, comment: req.comment});
// });
router.get("/:commentId/edit", middleware.checkCommentOwnerShip, function(req, res){
	Comment.findById(req.params.commentId, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {campgroundSlug: req.params.slug, comment: foundComment});
		}
	});	
});


// UPDATE Comment
router.put("/:commentId", middleware.checkCommentOwnerShip, function(req, res){
	Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, updatedComment){
		if(err || !updatedComment){
			req.flash("error", "Comment not found");
			return res.redirect("back");
		}
		req.flash("success", "Comment updated!");
		res.redirect("/campgrounds/" + req.params.slug);
	});
});


// DESTROY Comment
router.delete("/:commentId", middleware.checkCommentOwnerShip, function(req, res){
	Comment.findByIdAndRemove(req.params.commentId, function(err){
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Comment deleted!");
			res.redirect("/campgrounds/" + req.params.slug);
		}
	});
});

module.exports = router;

