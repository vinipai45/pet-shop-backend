const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../config/keys");
const { User, validateUser, validateLogin } = require("../models/user");
const jwt = require("jsonwebtoken");

//routes
exports.signup = async(req, res) => {
    try {
        const { email, name, password, phone } = req.body;
        if (!email || !name || !password || !phone) {
            return res.status(422).json({ error: "Please enter all the fields" });
        }
        const { error } = validateUser(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ error: "User already Exist" });

        user = new User(req.body);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const result = await user.save();
        return res.json(result);
    } catch (err) {
        console.error("Error", err);
    }
};

exports.signin = async(req, res) => {
    try {
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).json({ error: "Invalid username or password" });

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(400).json({ error: "Invalid username or password" });

        //create token
        const token = user.generateAuthToken();

        //put token in cookie
        res.cookie("token", token, { expire: new Date() + 9999 });

        const { _id, name, email, phone } = user;
        return res.json({ token, user: { _id, name, email, phone } });
    } catch (err) {
        console.error("Error", err);
    }
};

exports.signout = async(req, res) => {
    return res.clearCookie("token").json({ message: "Signout succesful" });
};

//protected routes
exports.isSignedIn = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            console.log("no authorization");
            return res.status(401).json({ error: "Access Denied" });
        }
        jwt.verify(authorization, JWT_SECRET, (err, payload) => {
            if (err) {
                console.log("not verified");
                return res.status(401).json({
                    error: "Session expired!",
                    message: "Please login to continue",
                });
            }
            const { _id } = payload;
            User.findById(_id)
                .then((userdata) => {
                    req.profile = userdata;
                    next();
                })
                .catch((err) => console.error(err));
        });
    } catch (err) {
        console.error("Error", err);
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Access Denied",
        });
    }
    next();
};