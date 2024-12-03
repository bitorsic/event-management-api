const express = require("express");
const app = express();
app.use(express.json());

require("dotenv").config();
const mongoose = require("mongoose");

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

(async () => {
	try {
		console.log("[+] Connecting to MongoDB...");
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("[+] Connection Successful");

		const port = process.env.PORT || 3000;
		app.listen(port, () => {
			console.log(`[+] App listening on port ${port}...`);
		});
	} catch (e) {
		console.log("[-] Connection Failed");
	}
})()