"use strict";

const { SuccessResponse } = require("../core/success.response");
const commentService = require("../services/comment.service");

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new comment",
            metadata: await commentService.createComment(req.body),
        }).send(res);
    };

    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: "Get comments",
            metadata: await commentService.getCommentsByParentId(req.query),
        }).send(res);
    };
}

module.exports = new CommentController();
