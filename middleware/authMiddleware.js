const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("../models/User");
require("dotenv").config({
	path: path.join(__dirname, "../.env")
});

const requireAuth = (req, res, next) => {
	const token = req.cookies.jwt;
	
	// Check JWT exists and is verified
	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
			if (error) {
				console.log("authMiddlewear.js [RequireAuth] [error] ", error.message);
				res.redirect("/login");
			} else {
				console.log("authMiddlewear.js [RequireAuth] ", decodedToken);
				next();
			}
		});
	} else {
		res.redirect("/login");
	}
}

// Check current user
const checkUser = (req, res, next) => {
	const token = req.cookies.jwt;
	
	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, async (error, decodedToken) => {
			if (error) {
				console.log("authMiddlewear.js [CheckUser] [error] ", error.message);
				res.locals.user = null;
				next();
			} else {
				console.log("authMiddlewear.js [CheckUser] ", decodedToken);
				let user = await User.findById(decodedToken.id);
				res.locals.user = user;
				next();
			}
		});
	} else {
		res.locals.user = null;
		next();
	}
}

module.exports = { checkUser, requireAuth };