var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
	name: {type: String, required: true},
	slug: {type: String, unique: true},
	price: String,
	image: String,
	description: String,
	created: { type: Date, default: Date.now},
	location: String,
	lat: Number,
	lng: Number,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
		firstName: String,
		lastName: String,
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	]
});

// add a slug before the campground gets saved to the database
campgroundSchema.pre('save', async function (next) {
    try {
        // check if a new campground is being saved, or if the campground name is being modified
        if (this.isNew || this.isModified("name")) {
			console.log("New campground: " + this.name);
            this.slug = await generateUniqueSlug(this._id, this.name);
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);

async function generateUniqueSlug(id, campgroundName, slug) {
    try {
        // generate the initial slug
        if (!slug) {
			eval(require('locus'));
            slug = slugify(campgroundName);
        }
		eval(require('locus'));
        // check if a campground with the slug already exists
        var campground = await Campground.findOne({slug: slug});
		eval(require('locus'));
        // check if a campground was found or if the found campground is the current campground
        if (!campground || campground._id.equals(id)) {
			eval(require('locus'));
            return slug;
        }
		eval(require('locus'));
        // if not unique, generate a new slug
        var newSlug = slugify(campgroundName);
        // check again by calling the function recursively
		eval(require('locus'));
        return await generateUniqueSlug(id, campgroundName, newSlug);
    } catch (err) {
		eval(require('locus'));
        throw new Error(err);
    }
}

function slugify(text) {
    var slug = text.toString().toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '')          // Trim - from end of text
      .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}

