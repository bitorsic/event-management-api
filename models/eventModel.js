const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: false },
	location: {
		latitude: { type: Number, required: false },
		longitude: { type: Number, required: false },
	},
	date: { type: Date, required: false },
	entryFee: { type: Number, required: true },
	attendees: [String],
	managers: [String],
});

module.exports = mongoose.model("events", eventSchema);