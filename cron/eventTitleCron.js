const cron = require("node-cron");
const { events } = require("../models");

const eventTitleCron = async () => {
	const allEvents = await events.find();

	for (let event of allEvents) {
		const timeDifference = (new Date() - event.date) / 1000 / 60 / 60 / 24; // days

		if (timeDifference > 1) { // older than a day
			event.title = `${event.title} (Inactive)`;
			await event.save();
		}
	}

	console.log(`Cron job completed execution at: ${new Date()}`);
}

cron.schedule(
	"0 0 * * *", 
	eventTitleCron,
	{ timezone: "Asia/Kolkata" }
);