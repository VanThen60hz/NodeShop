"use strict";

const { SuccessResponse } = require("../core/success.response");
const commentService = require("../services/comment.service");

class CommentController {
    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: "Get comments",
            metadata: await commentService.getCommentsByParentId(req.query),
        }).send(res);
    };

    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new comment",
            metadata: await commentService.createComment(req.body),
        }).send(res);
    };

    deleteComment = async (req, res, next) => {
        new SuccessResponse({
            message: "Delete comments successfully",
            metadata: await commentService.deleteComment(req.body),
        }).send(res);
    };
}

module.exports = new CommentController();
