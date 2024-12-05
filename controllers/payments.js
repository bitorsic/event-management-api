const Razorpay = require("razorpay");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')
const { users, events, payments } = require("../models");

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_ID,
	key_secret: process.env.RAZORPAY_SECRET,
});

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

const webhook = async (req, res) => {
	try {
		const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
		const webhookSignature = req.headers['x-razorpay-signature'];

		const isSignatureValid = validateWebhookSignature(
			JSON.stringify(req.body), webhookSignature, webhookSecret
		);

		if (!isSignatureValid) {
			console.log("Webhook signature was invalid");
			return;
		}
		
		// handle all unnecessary cases by just sending ok
		if (
			req.body.event !== 'payment.captured' &&
			req.body.event !== 'payment.failed'
		) {
			return res.status(200).send();
		}
		
		console.log(req.body.payload.payment.entity);
		// find and update payment with the order_id
		const payment = await payments.findOneAndUpdate(
			{ orderId: req.body.payload.payment.entity.order_id },
			{ status: req.body.payload.payment.entity.status },
		);
		if (!payment) {
			return res.status(400).send({ message: "No payment for given order"});
		}

		// stop if payment has failed
		if (req.body.event === 'payment.failed') return res.status(200).send();

		// modify event and user documents
		let event = await events.findById(payment.eventId);
		event.attendees.push(payment.email);
			
		const updatedUser = await users.findByIdAndUpdate(payment.email, {
			$push: { attending: event._id }
		});
		
		if (!updatedUser) {
			return res.status(404).send({ message: "User not found" });
		}
		
		await event.save();

		return res.status(200).send({ 
			message: `Successfully joined the event: ${event.title}`
		});
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
}

module.exports = {
	join,
	webhook,
}