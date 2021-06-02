const mongoose = require("mongoose");
const Joi = require("joi");

function validateCategory(category) {
	const schema = {
		name: Joi.string().max(32).min(3).required(),
	};
	return Joi.validate(category, schema);
}

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			maxlength: 32,
			minlength: 3,
			trim: true,
			required: true,
		},
	},
	{ timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
exports.Category = Category;
exports.CategorySchema = categorySchema;
exports.validateCategory = validateCategory;
