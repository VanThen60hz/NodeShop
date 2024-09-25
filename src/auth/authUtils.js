"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");

const { UnauthorizedError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
    API_KEY: "x-api-key",
    CLIENT_ID: "x-client-id",
    AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // accessToken
        const accessToken = JWT.sign(payload, publicKey, {
            // algorithm: "RS256",
            expiresIn: "2 days",
        });

        const refreshToken = JWT.sign(payload, privateKey, {
            // algorithm: "RS256",
            expiresIn: "7 days",
        });

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`Error verify accessToken: ${err}`);
            } else {
                // console.log(`Decoded accessToken: ${JSON.stringify(decode, null, 2)}`);
                console.log(`Decoded accessToken: ${decode}`);
            }
        });

        return { accessToken, refreshToken };
    } catch (error) {
        return error;
    }
};

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new UnauthorizedError("Unauthorized");
    console.log("userId: ", userId);

    const keyStore = await findByUserId(userId);
    if (!keyStore) throw new NotFoundError("Not found keyStore");

    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new UnauthorizedError("Unauthorized");

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
        if (userId !== decodeUser.userId) throw new UnauthorizedError("Invalid Token");

        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw new UnauthorizedError("Unauthorized");
    }
});

module.exports = {
    createTokenPair,
    authentication,
};
