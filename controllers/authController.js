const User = require("../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({
	path: path.join(__dirname, "../.env")
});

const handleErrors = error => {
	let errors = {};

	// Invalid username
	if (error.message === "Invalid username.") {
		errors.username = "That username is not registered.";
	}
	
	// Incorrect email
	if (error.message === "Incorrect email.") {
		errors.email = "That email address is not registered.";
	}
	
	// Incorrect password
	if (error.message === "Incorrect password.") {
		errors.password = "That password is incorrect.";
	}
	
	// Duplicate error code
	if (error.code === 11000) {
		if (error.message.indexOf("username") > -1) {
			errors.username = "That username is already in use.";
		}
		
		if (error.message.indexOf("email") > -1) {
			errors.email = "That email address is already in use.";
		}
	}

	// Validation Errors
	if (error.message.includes("user validation failed")) {
		Object.values(error.errors).forEach(({properties}) => {
			properties.message && (errors[properties.path] = properties.message);
		});
	}
	
	return errors;
}

const maxAge = 60 * 60 * 24 * 3; // 3 Days in seconds

const createToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: maxAge
	});
}

// Controller actions
module.exports.home = (req, res) => {
	res.render("home");
}

module.exports.signup_get = (req, res) => {
	res.render("signup");
}

module.exports.login_get = (req, res) => {
	res.render("login");
}

module.exports.signup_post = async (req, res) => {
	const { email, password, username } = req.body;
	
	try {
		const user = await User.create({
			email,
			password,
			username
		});

		const token = createToken(user._id);
		
		res.cookie("jwt", token, {
			httpOnly: true,
			maxAge: maxAge * 1000
		});

		res.status(201).json({
			user: user._id
		});
	} catch (err) {
		const errors = handleErrors(err);
		
		res.status(400).json({
			errors
		});
	}
}

module.exports.login_post = async (req, res) => {
	const { username, password } = req.body;
	
	try {
		const user = await User.login(
			username,
			password
		);
		
		const token = createToken(user._id);

		res.cookie("jwt", token, {
			httpOnly: true,
			maxAge: maxAge * 1000
		});
		
		res.status(200).json({
			user: user._id
		});
	} catch (err) {
		const errors = handleErrors(err);
		
		res.status(400).json({
			errors
		});
	}
}

module.exports.logout_get = (req, res) => {
	res.cookie("jwt", "", {
		maxAge: 1
	});

	res.redirect("/signup");
}