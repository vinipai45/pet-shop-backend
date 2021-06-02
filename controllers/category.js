const { Category } = require("../models/category");

exports.getCategoryById = (req, res, next, id) => {
	Category.findById(id).exec((err, category) => {
		if (err) return res.status(400).json({ error: "category not found" });
		req.category = category;
		next();
	});
};

exports.createCategory = (req, res) => {
	let category = new Category(req.body);
	category.save((err, category) => {
		if (err) return res.status(400).json({ error: "cannot save category" });
		return res.json(category);
	});
};

exports.getCategory = (req, res) => {
	res.json(req.category);
};

exports.getAllCategory = (req, res) => {
	Category.find().exec((err, categories) => {
		if (err) return res.status(400).json({ error: "No categories found" });
		return res.json(categories);
	});
};

exports.updateCategory = (req, res) => {
	let category = req.category;
	category.name = req.body.name;
	category.save((err, category) => {
		if (err) return res.status(400).json({ error: "failed to update" });
		return res.json(category);
	});
};

exports.deleteCategory = (req, res) => {
	const category = req.category;
	category.remove((err, category) => {
		if (err)
			return res.status(400).json({ error: "failed to delete category" });
		return res.json({ message: `Deleted ${category.name}!!` });
	});
};
