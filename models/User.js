const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		required: [true, "Please provide an email address."],
		unique: true,
		validate: [isEmail, "Please provide a valid email."]
	},
	password: {
		type: String,
		required: [true, "Please provide a password."],
		minlength: [8, "Minimum password length is 8 characters."]
	},
	username: {
		type: String,
		required: [true, "Please provide a username."],
		unique: true
	}
});

// Fire a function before doc saved to DB
userSchema.pre("save", async function(next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Static method to login user
userSchema.statics.login = async function(username, password) {
	const user = await this.findOne({ username });

	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		
		if (auth) {
			return user;
		}
		
		throw Error("Incorrect password.")
	}

	throw Error("Invalid username.");
}

const User = mongoose.model("user", userSchema);

module.exports = User;