"use strict";

const accessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");

class AccessController {
    handlerRefreshToken = async (req, res, next) => {
        // new OK({
        //     message: "Refresh token OK",
        //     metadata: await accessService.handlerRefreshToken(req.body.refreshToken),
        // }).send(res);

        new OK({
            message: "Refresh token OK",
            metadata: await accessService.handlerRefreshTokenV2(
                {
                    refreshToken: req.refreshToken,
                    user: req.user,
                    keyStore: req.keyStore,
                },
                req.body.refreshToken,
            ),
        }).send(res);
    };

    logout = async (req, res, next) => {
        new OK({
            message: "Logout OK",
            metadata: await accessService.logout(req.keyStore),
        }).send(res);
    };

    login = async (req, res, next) => {
        new SuccessResponse({
            message: "Login OK",
            metadata: await accessService.login(req.body),
        }).send(res);
    };

    signUp = async (req, res, next) => {
        new CREATED({
            message: "Register OK",
            metadata: await accessService.signUp(req.body),
            options: {
                limit: 10,
            },
        }).send(res);
    };
}

module.exports = new AccessController();
