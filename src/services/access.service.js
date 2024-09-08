"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

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

            const newShop = shopModel.create({
                name,
                email,
                passwordHash,
                role: [roles.SHOP],
            });

            if (newShop) {
                // created privateKey, publicKey
                const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: "spki",
                        format: "pem",
                    },
                    privateKeyEncoding: {
                        type: "pkcs8",
                        format: "pem",
                    },
                });

                console.log({ privateKey, publicKey });
            }
        } catch (error) {
            return {
                code: "xxx",
                message: error.message,
                status: "error",
            };
        }
    };
}

module.exports = new AccessService();
