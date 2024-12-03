"use strict";

const { SuccessResponse } = require("../core/success.response");
const { listNotiByUser } = require("../services/notification.service");

class NotificationController {
    async listNotiByUser(req, res, next) {
        new SuccessResponse({
            message: "list notification retrieve successfully",
            metadata: await listNotiByUser(req.query),
        }).send(res);
    }
}

module.exports = new NotificationController();
