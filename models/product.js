const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { ObjectId } = mongoose.Schema.Types;

function validateProduct(product) {
    const schema = {
        name: Joi.string().max(32).min(3).required(),
        description: Joi.string().max(1000).required(),
        price: Joi.number().required(),
        category: Joi.objectId().required(),
        photo: Joi.string().required(),
    };
    return Joi.validate(product, schema);
}

const productSchema = new mongoose.Schema({
    postedBy: {
        type: ObjectId,
        ref: "User",
    },
    name: {
        type: String,
        maxlength: 32,
        minlength: 3,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        required: true,
    },
    price: {
        type: Number,
        maxlength: 32,
        trim: true,
        required: true,
    },
    address: {
        type: String,
    },
    category: {
        type: ObjectId,
        ref: "Category",
        required: true,
    },
    photo: {
        type: String,
    },
    orderedBy: [{ type: ObjectId, ref: "User" }],
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
exports.Product = Product;
exports.validateProduct = validateProduct;