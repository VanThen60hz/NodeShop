"use strict";

const Comment = require("../models/comment.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");

const mongoose = require("mongoose");
const { convertToObjectIdMongodb } = require("../utils");

/*
  Key features: Comment service
  + Add comment [User, Shop]
  + Get a list of comments [User, Shop]
  + Delete a comment [User | Shop | Admin]
*/

class CommentService {
    static async createComment({ productId, userId, content, parentCommentId = null }) {
        if (!productId || !userId || !content) {
            throw new Error("Missing required fields: productId, userId, content");
        }

        const newComment = new Comment({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId,
        });

        let insertPosition;

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) throw new NotFoundError("Parent comment not found");

            insertPosition = parentComment.comment_right;

            await Comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_right: { $gte: insertPosition },
                },
                {
                    $inc: { comment_right: 2 },
                },
            );

            await Comment.updateMany(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                    comment_left: { $gt: insertPosition },
                },
                {
                    $inc: { comment_left: 2 },
                },
            );
        } else {
            const maxCommentRight = await Comment.findOne(
                {
                    comment_productId: convertToObjectIdMongodb(productId),
                },
                "comment_right",
                { sort: { comment_right: -1 } },
            );

            insertPosition = maxCommentRight ? maxCommentRight.comment_right + 1 : 1;
        }

        newComment.comment_left = insertPosition;
        newComment.comment_right = insertPosition + 1;

        await newComment.save();

        return newComment;
    }
    static async getCommentsByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0, // skip
    }) {
        const productObjectId = convertToObjectIdMongodb(productId);
        const filter = { comment_productId: productObjectId };

        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId);
            if (!parent) throw new NotFoundError("Not found comment for id");

            filter.comment_left = { $gt: parent.comment_left };
            filter.comment_right = { $lte: parent.comment_right };
        } else {
            filter.comment_parentId = parentCommentId;
        }

        const comments = await Comment.find(filter)
            .select("comment_left comment_right comment_content comment_parentId")
            .sort("comment_left")
            .limit(limit)
            .skip(offset);

        return comments;
    }
}

module.exports = CommentService;
