"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, ConflictRequestError, UnauthorizedError } = require("../core/error.response");
const roles = require("../constants/roles"); // Import roles từ constants
const { findByEmail } = require("../services/shop.service");

class AccessService {
    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail(email);
        if (!foundShop) {
            throw new BadRequestError("Shop not registered");
        }

        const isMatch = await bcrypt.compare(password, foundShop.password);
        if (!isMatch) {
            throw new UnauthorizedError("Password is incorrect");
        }

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey);

        await keyTokenService.createKeyToken({
            userId: foundShop._id,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
        });

        return {
            shop: getInfoData({ fields: ["_id", "name", "email"], object: foundShop }),
            tokens,
        };
    };

    static signUp = async ({ name, email, password }) => {
        // try {
        //step 1: check email exists?
        const holderShop = await shopModel.findOne({ email }).lean();

        if (holderShop) {
            throw new BadRequestError("Shop already exists");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            role: [roles.SHOP], // Sử dụng roles từ constants
        });

        if (newShop) {
            // created privateKey, publicKey
            // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: "pkcs1", // public key crypto system 1
            //         format: "pem", //privacy-enhanced mail
            //     },
            //     privateKeyEncoding: {
            //         type: "pkcs1",
            //         format: "pem",
            //     },
            // });

            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");

            console.log({ privateKey, publicKey });

            const keyStore = await keyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                return {
                    code: "xxx",
                    message: "Error when create keyStore",
                };
            }

            // create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
            console.log("Created Token Success: ", tokens);

            return {
                shop: getInfoData({ fields: ["_id", "name", "email"], object: newShop }),
                tokens,
            };
        }

        return {
            code: "200",
            metadata: null,
        };
        // } catch (error) {
        //     return {
        //         code: "xxx",
        //         message: error.message,
        //         status: "error",
        //     };
        // }
    };
}

module.exports = AccessService;
