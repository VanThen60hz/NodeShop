"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const roles = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            //step 1: check email exists?
            const holderShop = await shopModel.findOne({ email }).lean();

            if (holderShop) {
                return {
                    code: "xxx",
                    message: "Shop already registered",
                };
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const newShop = await shopModel.create({
                name,
                email,
                password: passwordHash,
                role: [roles.SHOP],
            });

            if (newShop) {
                // created privateKey, publicKey
                const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: "pkcs1", // public key crypto system 1
                        format: "pem", //privacy-enhanced mail
                    },
                    privateKeyEncoding: {
                        type: "pkcs1",
                        format: "pem",
                    },
                });

                console.log({ privateKey, publicKey });

                const publicKeyString = await keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                });

                if (!publicKeyString) {
                    return {
                        code: "xxx",
                        message: "Error when create publicKey",
                    };
                }

                const publicKeyObject = crypto.createPublicKey(publicKeyString);
                console.log("Public Key Object: ", publicKeyObject);

                // create token pair
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyString, privateKey);
                console.log("Created Token Success: ", tokens);

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop }),
                        tokens,
                    },
                };
            }

            return {
                code: "200",
                metadata: null,
            };
        } catch (error) {
            return {
                code: "xxx",
                message: error.message,
                status: "error",
            };
        }
    };
}

module.exports = AccessService;
