"use strict";

const keyTokenModel = require("../models/keyToken.model");
const { Types } = require("mongoose");

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // level 0
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // });
            // return tokens ? tokens.publicKey : null;

            // level xxx
            const filter = { user: userId },
                update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken },
                options = { upsert: true, new: true };

            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);

            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: userId });
    };

    static removeKeyToken = async (id) => {
        return await keyTokenModel.deleteOne(id);
    };

    static findByRefreshToken = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshToken });
    };

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keyTokenModel.findOne({ refreshTokenUsed: refreshToken });
    };

    static deleteKeyByUserId = async (userId) => {
        return await keyTokenModel.deleteOne({ user: userId });
    };

    static updateRefreshTokenUsed = async (userId, refreshToken) => {
        return await keyTokenModel.updateOne(
            { user: userId },
            {
                $addToSet: { refreshTokenUsed: refreshToken },
            },
        );
    };
}

module.exports = KeyTokenService;
