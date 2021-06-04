const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { ObjectId } = mongoose.Schema.Types;

function validateCategory(animal) {
    const schema = {
        name: Joi.string().max(32).min(3).required(),
    };
    return Joi.validate(animal, schema);
}

const animalSchema = new mongoose.Schema({
    category: {
        type: ObjectId,
        ref: "Category",
        required: true,
    },
    photo: {
        type: String,
        minlength: 3,
        trim: true,
        required: true,
    },
}, { timestamps: true });

const Animal = mongoose.model("Animal", animalSchema);
exports.Animal = Animal;
exports.AnimalSchema = animalSchema;
exports.validateCategory = validateCategory;