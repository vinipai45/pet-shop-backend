const express = require("express");
const router = express.Router();
const { isAdmin, isSignedIn } = require("../controllers/auth");
const { createAnimal, getAllAnimals } = require("../controllers/animal");

router.get("/animals", getAllAnimals);
router.post("/create-animal", isSignedIn, isAdmin, createAnimal);

module.exports = router;