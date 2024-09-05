"use strict";

const mongoose = require("mongoose");

const connectString = "mongodb://localhost:27017/nodeshop";

const { countConnect } = require("../helpers/check.connect");

class Database {
    constructor() {
        this._connect();
    }
    _connect(type = "mongodb") {
        //dev
        if (1 == 1) {
            mongoose.set("debug", true);
            mongoose.set("debug", { color: true });
        }

        mongoose
            .connect(connectString)
            .then((_) => {
                console.log("MongoDB connection successful PRO");
                countConnect();
            })
            .catch((err) => {
                console.error("Database connection error");
            });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongoDB = Database.getInstance();

module.exports = instanceMongoDB;
