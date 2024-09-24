"use strict";

const HEADER = {
    API_KEY: "x-api-key",
    AUTHORIZATION: "authorization",
};

const { findById } = require("../services/apiKey.service");

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY];
        if (!key) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        // check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        req.objKey = objKey;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
};

const permission = (permission) => {
    return (req, res, next) => {
        const { objKey } = req;
        if (!objKey.permissions) {
            return res.status(403).json({
                message: "Permission denied",
            });
        }

        console.log(`Permission: ${objKey.permissions}`);

        const validPermission = objKey.permissions.includes(permission);

        if (!validPermission) {
            return res.status(403).json({
                message: "Permission denied",
            });
        }

        return next();
    };
};

module.exports = {
    apiKey,
    permission,
};
