const Razorpay = require("razorpay");
const { users, events, payments } = require("../models");

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_ID,
	key_secret: process.env.RAZORPAY_SECRET,
});

const randomStringGenerator = () => {
	const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let string = '';

	for (let i = 0; i < 6; i++) {
		string += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	
	return string;
}

const join = async (req, res) => {
	try {
		const event = await events.findById(req.params.id);

		if (!event) {
			return res.status(400).send({ 
				message: "Event with given ID not found" 
			});
		}

		if (event.managers.includes(req.user.email)) {
			return res.status(400).send({ message: "Manager cannot be an attendee" });
		}

		if (event.attendees.includes(req.user.email)) {
			return res.status(400).send({ message: "You are already attending the event" });
		}

		const options = {
			amount: event.entryFee * 100,
			currency: "INR",
			notes: {
				eventTitle: event.title,
			}
		}

		const order = await razorpay.orders.create(options);
		
		const payment = {
			orderId: order.id,
			email: req.user.email,
			eventId: event._id,
			status: order.status,
		}

		await payments.create(payment);

		res.status(201).send(order);
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
}

module.exports = {
	join,
}