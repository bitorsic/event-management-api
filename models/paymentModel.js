const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
	orderId: { type: String, required: true, unique: true, index: true },
	email: { type: String, required: true },
	eventId: {type: mongoose.Types.ObjectId, required: true },
	status: { type: String, required: true },
});

module.exports = mongoose.model("payments", paymentSchema);