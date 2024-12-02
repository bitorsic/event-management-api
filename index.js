const express = require("express");
const app = express();
app.use(express.json());

require("dotenv").config();
const mongoose = require("mongoose");

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