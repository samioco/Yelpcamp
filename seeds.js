var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment   = require("./models/comment");

var data = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id diam vel quam elementum pulvinar etiam non quam. Ultricies mi quis hendrerit dolor magna eget. Lacus viverra vitae congue eu consequat ac. Sagittis id consectetur purus ut faucibus pulvinar elementum integer. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam. Quis lectus nulla at volutpat diam ut. Sit amet volutpat consequat mauris nunc congue. Sed id semper risus in hendrerit gravida rutrum quisque non. Duis ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Tortor pretium viverra suspendisse potenti nullam ac. Suspendisse interdum consectetur libero id faucibus nisl tincidunt."
    },
    {
        name: "Desert Mesa", 
        image: "https://media.kare11.com/assets/KARE/images/437173820/437173820_750x422.png",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id diam vel quam elementum pulvinar etiam non quam. Ultricies mi quis hendrerit dolor magna eget. Lacus viverra vitae congue eu consequat ac. Sagittis id consectetur purus ut faucibus pulvinar elementum integer. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam. Quis lectus nulla at volutpat diam ut. Sit amet volutpat consequat mauris nunc congue. Sed id semper risus in hendrerit gravida rutrum quisque non. Duis ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Tortor pretium viverra suspendisse potenti nullam ac. Suspendisse interdum consectetur libero id faucibus nisl tincidunt."
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id diam vel quam elementum pulvinar etiam non quam. Ultricies mi quis hendrerit dolor magna eget. Lacus viverra vitae congue eu consequat ac. Sagittis id consectetur purus ut faucibus pulvinar elementum integer. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam. Quis lectus nulla at volutpat diam ut. Sit amet volutpat consequat mauris nunc congue. Sed id semper risus in hendrerit gravida rutrum quisque non. Duis ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Tortor pretium viverra suspendisse potenti nullam ac. Suspendisse interdum consectetur libero id faucibus nisl tincidunt."
    }
]

function seedDB(){
	// Remove all comments
	Comment.deleteMany({}, function(err){
		if(err){
			console.log(err);
		}
	});
	
	// Remove all campgrounds
	Campground.deleteMany({}, function(err){
		if(err){
			console.log(err);
		} else {
			console.log("Removed all campgrounds from db!");
			// Add campgrounds
			data.forEach(function(seed){
				Campground.create(seed, function(err, campground){
					if(err){
						console.log(err);
					} else {
						console.log("Added campground: " + campground.name);
						// Create comments
						Comment.create({
							text: "This place is great, but I wish there was internet!",
							author: "Homer"
						}, function(err, comment){
							if(err){
								console.log(err);
							} else {
								campground.comments.push(comment);
								campground.save();
								console.log("Created new comment.");
							}
						});
					}
				});
			});
		}
	});	
}

module.exports = seedDB;
