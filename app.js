require('dotenv').config()
const express = require("express");
const cors = require('cors')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { MONGOURL } = require("./config/keys");
const auth = require("./routes/auth");
const user = require("./routes/user");
const category = require("./routes/category");
const product = require("./routes/product");
const animal = require("./routes/animal");

// const stripe = require("./routes/stripepayment");
const app = express();
app.use(cors())
    //DB CONNECTION
mongoose
    .connect(MONGOURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error", err));

//MIDDLEWARES
app.use(bodyParser.json());
app.use(cookieParser());

//PORT
const PORT = process.env.PORT || 5000;

//ROUTES
app.use("/api", auth);
app.use("/api", user);
app.use("/api", category);
app.use("/api", product);
app.use("/api", animal);
// app.use("/api", stripe);

//STARTING A SERVER
app.listen(PORT, () => console.log(`App listening at port ${PORT}`));