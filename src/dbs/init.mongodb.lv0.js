"use strict";

const mongoose = require("mongoose");

const connectString = "mongodb://localhost:27017/nodeshop";
mongoose
    .connect(connectString)
    .then((_) => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error(err);
    });

//dev
if (1 == 1) {
    mongoose.set("debug", true);
    mongoose.set("debug", { color: true });
}

module.exports = mongoose;
