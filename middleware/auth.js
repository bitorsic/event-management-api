const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
	try {
		let token = req.headers.authorization;
		if (!token) throw 403;

		token = token.split(' ')[1];
		const { email } = jwt.verify(token, process.env.JWT_SECRET);

		req.user = { email };
		next();
	} catch (e) {
		let code = 401, message = "Invalid Token";
		if (e == 403) { code = e, message = "Not logged in" }
		if (e == 401) code = e;
		res.status(code).send({ message });
	}
};

module.exports = verifyToken;