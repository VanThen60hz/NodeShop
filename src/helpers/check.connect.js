"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

//count connections
const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections: ${numConnection}`);
};

//check overload
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        //Example maximum number of connections based on the number of cores
        const maxConnections = numCores * 5;

        console.log(`Active connections: ${numConnection}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);

        // nên đặt so sánh ở if nhỏ hơn maxConnections để có bị overload thì còn kịp xử lý
        if (numConnection > maxConnections) {
            console.log(`Overload detected: ${numConnection} connections`);
            // notify.send(...)
        }
    }, _SECONDS); // Monitor every 5 seconds
};

module.exports = {
    countConnect,
    checkOverload,
};
