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

module.exports = {
	register,
}