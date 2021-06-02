const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
Joi.objectId = require("joi-objectid")(Joi);
const { ObjectId } = mongoose.Schema.Types;

function validateUser(user) {
    const schema = {
        name: Joi.string().max(32).min(3).required(),
        email: Joi.string().required().email(),
        password: Joi.string().min(5).required(),
        phone: Joi.number().required(),
        purchase: Joi.array(),
    };
    return Joi.validate(user, schema);
}

function validateLogin(req) {
    const schema = {
        email: Joi.string().min(5).max(50).required().email(),
        password: Joi.string().min(5).max(255).required(),
    };
    return Joi.validate(req, schema);
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: 32,
        minlength: 3,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        ensureIndex: true,
    },
    address: {
        type: String,
        trim: true,
        minlength: 5,
    },
    phone: {
        type: Number,
        match: /^[6-9]\d{9}$/,
        required: true,
    },
    password: {
        type: String,
        minlength: 5,
        required: true,
    },
    role: {
        type: Number, //0-user 1-admin
        default: 0,
    },
    purchases: [{
        default: [],
    }, ],
}, { timestamps: true });

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, JWT_SECRET, { expiresIn: "1d" });
    return token;
};

const User = mongoose.model("User", userSchema);
exports.User = User;
exports.validateUser = validateUser;
exports.validateLogin = validateLogin;