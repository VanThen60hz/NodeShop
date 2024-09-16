"use strict";

const JWT = require("jsonwebtoken");

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

module.exports = {
    createTokenPair,
};
