const { users } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
	try {
		let user = {
			_id: req.body.email,
			password: await bcrypt.hash(req.body.password, 10),
		}

		user = await users.create(user);

		res.status(201).send({
			message: `Successfully registered as ${user._id}`,
		})
	} catch (e) {
		let code = 500, message = e.message;
		if (e.code == 11000) { code = 409; message = "Email already in use" };
		res.status(code).send({message});
	}
}

const login = async (req, res) => {
	try {
		const user = await users.findById(req.body.email);

		if (!user) throw 400;
		if (!await bcrypt.compare(req.body.password, user.password)) throw 403;

		const token = jwt.sign(
			{ email: user._id },
			process.env.JWT_SECRET,
			{ expiresIn: "15m"},
		)

		res.status(200).send({ token });
	} catch (e) {
		let code = 500, message = e.message;
		if (e == 400) { code = e, message = "User not found" }
		if (e == 403) { code = e, message = "Incorrect password" }
		res.status(code).send({ message });
	}
}

module.exports = {
	register,
	login,
}