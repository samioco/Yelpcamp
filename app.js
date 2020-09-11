require('dotenv').config();
var express 		= require("express"), 				// Framework
	app 			= express(), 						// Express framework variable
	mongoose 		= require("mongoose"), 				// MongoDB
	seedDB			= require("./seeds"),				// Seeding the database
	flash			= require("connect-flash"), 		// Flash
	bodyParser 		= require("body-parser"), 			// Parsing html body data
	passport		= require("passport"),				// User authentication
	LocalStrategy	= require("passport-local"),		// User authentication
	methodOverride	= require("method-override"),		// Using PUT requests in forms
	Campground 		= require("./models/campground"),	// Model: Campground
	Comment 		= require("./models/comment"),		// Model: Comment
	User			= require("./models/user");			// Model: User

// Requiring routes
var campgroundRoutes	= require("./routes/campgrounds"),
	commentRoutes 		= require("./routes/comments"),
	userRoutes			= require("./routes/users"),
	indexRoutes			= require("./routes/index");

// Database
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/yelpcamp");

// mongoose.connect("mongodb+srv://mongodbusername:mongodbpw@cluster0.5dz6t.mongodb.net/<dbname>?retryWrites=true&w=majority", {
// 	useNewUrlParser: true,
// 	useCreateIndex: true
// }).then(() => {
// 	console.log('Connected to DB!');
// }).catch(err => {
// 	console.log('ERROR:', err.message);
// });

// seedDB(); //seed the database

app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Sam is still the man because I am!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
// app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:slug/comments", commentRoutes);
app.use("/users", userRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("YelpCamp Server has started!")
});
