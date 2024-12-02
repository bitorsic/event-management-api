const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: {type: String, required: false },
	location: {
		latitude: Number,
		longitude: Number,
	},
	date: Date,
	attendees: [String],
	managers: [String],
});

module.exports = mongoose.Model("events", eventSchema);