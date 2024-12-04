const router = require("express").Router();
const controller = require("../controllers/payments");
const verifyToken = require("../middleware/auth");

router.put("/attendance/:id", verifyToken, controller.join);

module.exports = router;