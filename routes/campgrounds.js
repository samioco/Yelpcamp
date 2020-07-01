var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);

// IMAGE STORAGE CONFIGURATION
// var multer = require('multer');
// var storage = multer.diskStorage({
//   filename: function(req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   }
// });
// var imageFilter = function (req, file, cb) {
//     // accept image files only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };
// var upload = multer({ storage: storage, fileFilter: imageFilter});

// var cloudinary = require('cloudinary');
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });



// INDEX: show all campgrounds
router.get("/", function(req, res){
	if (req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Campground.find({$or: [{"name": regex}, {"location": regex}, {"description": regex}, {"comments": regex}]}, function(err, foundCampgrounds){
		Campground.find({name: regex}, function(err, foundCampgrounds){
			if (err) {
				req.flash("error", err.message);
				return res.redirect("back");
			} else if (foundCampgrounds.length<1) {
				Campground.find({}, function(err, allCampgrounds){
					if(err){
						req.flash("error", err.message);
						return res.redirect("back");
					} else {
						res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
					}
				});
			} else {
				res.render("campgrounds/index", {campgrounds: foundCampgrounds, page: 'campgrounds'});
			}
		});	
	} else {
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			} else {
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
			}
		});
	}
});


// NEW campground form
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	// console.log(req.body);
	
	// eval(require('locus'));
	// if (req.body.image_upload) {
	// 	eval(require('locus'));
	// 	upload.single(req.body.image_upload);
	// 	cloudinary.uploader.upload(req.file.path, function(result) {
	// 		req.body.campground.image = result.secure_url;
	// 	});
	// } else if (req.body.image_url) {
	// 	req.body.campground.image = req.body.image_url;
	// }
	// eval(require('locus'));

	req.body.campground.author = {
		id: req.user._id,
		username: req.user.username,
		firstName: req.user.firstName,
		lastName: req.user.lastName
	}
	
	geocoder.geocode(req.body.campground.location, function (err, data) {
		if(err){
			console.log(err);
		} else {
			req.body.campground.lat = data[0].latitude;
			req.body.campground.lng = data[0].longitude;
			req.body.campground.location = data[0].formattedAddress;	
		}
	});
    
    Campground.create(req.body.campground, function(err, newCampground){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newCampground);
            res.redirect("/campgrounds/" + newCampground.slug);
        }
    });
});




// SHOW: detailed page about one campground
// router.get("/:id", function(req, res){
// 	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
// 		if(err || !foundCampground){
// 			console.log(err);
// 			req.flash("error", "Sorry, that campground does not exist!");
// 			return res.redirect("/campgrounds");
// 		}
// 		res.render("campgrounds/show", {campground: foundCampground});				
// 	});	
// });
router.get("/:slug", function(req, res){
	Campground.findOne({slug: req.params.slug}).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			console.log(err);
			req.flash("error", "Sorry, that campground does not exist!");
			return res.redirect("/campgrounds");
		}
		res.render("campgrounds/show", {campground: foundCampground});				
	});	
});


// EDIT
router.get("/:slug/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findOne({slug: req.params.slug}, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: req.campground});
	});
});

// UPDATE CAMPGROUND ROUTE
// router.put("/:slug", middleware.checkCampgroundOwnership, function(req, res){
// 	geocoder.geocode(req.body.campground.location, function (err, data) {
// 		req.body.campground.lat = data[0].latitude;
// 		req.body.campground.lng = data[0].longitude;
// 		req.body.campground.location = data[0].formattedAddress;
// 	});
// 	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
// 		if(err || !updatedCampground){
// 			req.flash("error", err.message);
// 			res.redirect("back");
// 		} else {
// 			req.flash("success","Successfully Updated!");
// 			res.redirect("/campgrounds/" + updatedCampground._id);
// 		}
// 	});
// });

router.put("/:slug", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findOne({slug: req.params.slug}, function(err, campground){
		if(err || !campground){
			req.flash("error", err.message);
			res.redirect("back");
		} else {
			geocoder.geocode(req.body.campground.location, function (err, data) {
				campground.lat = data[0].latitude;
				campground.lng = data[0].longitude;
				campground.location = data[0].formattedAddress;
			});
			campground.save(function(err){
				if(err){
					console.log(err);
					res.redirect("back");
				} else {
					req.flash("success","Successfully Updated!");
					res.redirect("/campgrounds/" + campground.slug);
				}
			});
		}
	});
});



// DELETE
router.delete("/:slug", middleware.checkCampgroundOwnership, function(req, res){
	//Object.findByIdAndRemove(id, callback)
	Campground.findByIdAndRemove({slug: req.params.slug}, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Campground deleted!");
			res.redirect("/campgrounds");
		}
	});
});


// function escapeRegex(text) {
//     return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
// };


module.exports = router;

