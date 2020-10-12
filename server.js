const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

// ENV variables
const path = require("path");
require("dotenv").config({
	path: path.join(__dirname, ".env")
});

// Initiat Server
const server = express();

// Middlewear test
server.use((req, res, next) => {
	console.log('New incoming request:');
	console.log('Host: ', req.hostname);
	console.log('Path: ', req.path);
	console.log('Method: ', req.method);
	next();
});

// Middleware
server.use(express.static("public"));
server.use(express.json());
server.use(cookieParser());

// View engine
server.set("view engine", "ejs");

// DB connection
mongoose.connect(
	process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	}
).then((result) => server.listen(process.env.PORT))
.catch((error) => console.log("server.js ", error));

// Routes
server.use(authRoutes);

// 404
server.use((req, res) => {
	res.status(404).render('404', {
		title: '404 - Page Not Found'
	});
});

// Cookies
/* app.get("/set-cookies", (req, res) => {
	//res.setHeader("Set-Cookie", "newUser=true");
	res.cookie("newUser", false);
	res.cookie("isEmployee", true, {
		//maxAge: 5000,
		//secure: true // HTTPS only
		httpOnly: true
	});
	res.send("You got the cookies!");
});

app.get("/read-cookies", (req, res) => {
	const cookies = req.cookies;
	res.json(cookies);
}); */