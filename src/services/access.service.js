"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, ConflictRequestError, ForbiddenError, UnauthorizedError } = require("../core/error.response");
const roles = require("../constants/roles"); // Import roles từ constants
const { findByEmail } = require("../services/shop.service");

class AccessService {
    static handlerRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
        const { userId, email } = user;

        if (keyStore.refreshTokenUsed.includes(refreshToken)) {
            await keyTokenService.deleteKeyByUserId(userId);

            throw new ForbiddenError("Refresh token is invalid! Login again");
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new UnauthorizedError("Refresh token is invalid");
        }

        const foundShop = await findByEmail(email);
        if (!foundShop) {
            throw new UnauthorizedError("Shop not found");
        }

        // create new token pair
        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey);

        // update refreshTokenUsed
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokenUsed: refreshToken,
            },
        });

        return {
            user,
            tokens,
        };
    };

    static handlerRefreshToken = async (refreshToken) => {
        console.log("refreshToken: ", refreshToken);
        const foundToken = await keyTokenService.findByRefreshTokenUsed(refreshToken);
        if (!foundToken) {
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log("userId, email: ", userId, email);

            await keyTokenService.deleteKeyByUserId(userId);

            throw new ForbiddenError("Refresh token is invalid! Login again");
        }

        const holderToken = await keyTokenService.findByRefreshToken(refreshToken);
        if (!holderToken) {
            throw new UnauthorizedError("Refresh token is invalid");
        }

        // verify Token
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log("2: userId, email: ", userId, email);

        // check userId
        const foundShop = await findByEmail(email);
        if (!foundShop) {
            throw new UnauthorizedError("Shop not found");
        }

        // create new token pair
        const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey);

        // update refreshTokenUsed
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokenUsed: refreshToken,
            },
        });

        return {
            user: { userId, email },
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await keyTokenService.removeKeyToken(keyStore._id);
        console.log("Deleted Key: ", delKey);
        return delKey;
    };

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

        const { _id: userId } = foundShop;
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey);

        await keyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
        });

        // Cập nhật refreshTokenUsed
        // await keyTokenService.updateRefreshTokenUsed(userId, tokens.refreshToken);

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
            const { _id: userId } = newShop;
            const tokens = await createTokenPair({ userId, email }, publicKey, privateKey);

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
