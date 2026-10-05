const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const {
  createUser,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));


router.post("/users", createUser);


module.exports = router;
