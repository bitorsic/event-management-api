const router = require("express").Router();
const controller = require("../controllers/events");
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, controller.create);
router.get("/", verifyToken, controller.read);
router.put("/:id", verifyToken, controller.update);
router.delete("/:id", verifyToken, controller.remove);
router.put("/attendance/:id", verifyToken, controller.attendance);
router.put("/managers/:id", verifyToken, controller.addRemoveManager);

module.exports = router;