const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	_id: { type: String, required: true },
	password: { type: String, required: true },
	attending: [mongoose.Types.ObjectId],
	manages: [mongoose.Types.ObjectId],
});

module.exports = mongoose.model("users", userSchema);