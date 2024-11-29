const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// test pub sub service
// Test Pub/Sub Redis
// require("./tests/inventory.test");
// const productTest = require("./tests/product.test");
// productTest.purchaseProduct("product:001", 10);

// init db
require("./dbs/init.mongodb");

// init routes
app.use("/", require("./routers"));

// handle error
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: "error",
        code: statusCode,
        stack: error.stack,
        message: error.message || "Internal Server Error",
    });
});

module.exports = app;
