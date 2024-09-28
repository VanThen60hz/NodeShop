"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const { use } = require("../routers");

class AccessController {
    handlerRefreshToken = async (req, res, next) => {
        // new OK({
        //     message: "Refresh token OK",
        //     metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
        // }).send(res);

        new OK({
            message: "Refresh token OK",
            metadata: await AccessService.handlerRefreshTokenV2(
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
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    };

    login = async (req, res, next) => {
        new SuccessResponse({
            message: "Login OK",
            metadata: await AccessService.login(req.body),
        }).send(res);
    };

    signUp = async (req, res, next) => {
        new CREATED({
            message: "Register OK",
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10,
            },
        }).send(res);
    };
}

module.exports = new AccessController();
