const express = require("express");
const router = express.Router();
const {
	getCategoryById,
	createCategory,
	getCategory,
	getAllCategory,
	updateCategory,
	deleteCategory,
} = require("../controllers/category");
const { isSignedIn, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//params
router.param("userId", getUserById);
router.param("categoryId", getCategoryById);

//routes
router.post("/category/create/:userId", isSignedIn, isAdmin, createCategory);
router.get("/category/:categoryId", getCategory);
router.get("/categories", getAllCategory);
router.put(
	"/category/update/:categoryId/:userId",
	isSignedIn,
	isAdmin,
	updateCategory
);
router.delete(
	"/category/:categoryId/:userId",
	isSignedIn,
	isAdmin,
	deleteCategory
);

module.exports = router;
