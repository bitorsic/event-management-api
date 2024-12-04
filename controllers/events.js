const { users, events } = require("../models");

const create = async (req, res) => {
	try {
		let event = req.body;

		event.managers = [req.user.email];
		
		event = await events.create(event);

		const updatedUser = await users.findByIdAndUpdate(req.user.email, {
			$push: { manages: event._id }
		});

		if (!updatedUser) {
			return res.status(404).send({ message: "User not found" });
		}

		res.status(201).send({ id: event._id });
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
}

const read = async (req, res) => {
	try {
		if (req.query.id) {
			const event = await events.findById(req.query.id);
			return res.status(200).send(event);
		}

		if (req.query.flag === "attending") {
			const allEvents = await events.find({
				attendees: { $in: req.user.email },
			}).sort({ date: -1 });
			return res.status(200).send(allEvents);
		}

		if (req.query.flag === "manages") {
			const allEvents = await events.find({
				managers: { $in: req.user.email },
			}).sort({ date: -1 });
			return res.status(200).send(allEvents);
		}

		const allEvents = await events.find().sort({ date: -1 });
		res.status(200).send(allEvents);
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
}

const update = async (req, res) => {
	try {
		const keys = Object.keys(req.body);

		if (keys.includes("attendees") || keys.includes("managers")) {
			return res.status(400).send({ message: "Cannot update attendees or managers" });
		}

		const updatedEvent = await events.findOneAndUpdate(
			{
				_id: req.params.id,
				managers: { $in: req.user.email },
			},
			req.body,
			{ new: true }
		)

		if (!updatedEvent) {
			return res.status(403).send({ message: "Event not found / Access Denied" });
		}

		res.status(200).send(updatedEvent);
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
}

const remove = async (req, res) => {
	try {
		const deletedEvent = await events.findOneAndDelete({
			_id: req.params.id,
			managers: { $in: req.user.email },
		})

		if (!deletedEvent) {
			return res.status(403).send({ message: "Event not found / Access Denied" });
		}

		res.status(200).send({ message: "Event deleted successfully"});
	} catch (e) {
		res.status(500).send({ message: e.message });
	}
}

const addRemoveManager = async (req, res) => {
	try {
		if (req.query.email === req.user.email) {
			return res.status(400).send({ 
				message: "Cannot add/remove yourself from managers" 
			});
		}

		const event = await events.findOne({
			_id: req.params.id,
			managers: { $in: req.user.email },
		})

		if (!event) {
			return res.status(403).send({ message: "Event not found / Access Denied" });
		}

		if (event.attendees.includes(req.query.email)) {
			return res.status(400).send({ message: "Attendee cannot be a manager" });
		}

		// add manager
		if (!event.managers.includes(req.query.email)) {
			event.managers.push(req.query.email);

			const updatedUser = await users.findByIdAndUpdate(req.query.email, {
				$push: { manages: event._id }
			});
			
			if (!updatedUser) {
				return res.status(404).send({ message: "User not found" });
			}

			await event.save();

			return res.status(200).send({ 
				message: `Successfully added ${updatedUser._id} as a manager for the event: ${event.title}`
			});
		}

		// remove manager
		const index = event.managers.indexOf(req.query.email);
		event.managers.splice(index, 1);

		const updatedUser = await users.findByIdAndUpdate(req.query.email, {
			$pull: { manages: event._id }
		});
		
		if (!updatedUser) {
			return res.status(404).send({ message: "User not found" });
		}

		await event.save();

		res.status(200).send({ 
			message: `Successfully removed ${updatedUser._id} as a manager from the event: ${event.title}`
		});

	} catch (e) {
		res.status(500).send({ message: e.message });
	}
}

module.exports = {
	create,
	read,
	update,
	remove,
	addRemoveManager,
}