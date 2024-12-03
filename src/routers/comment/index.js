"use strict";

const express = require("express");
const commentController = require("../../controllers/comment.controller");
const router = express.Router();

const { authenticationV2 } = require("../../auth/authUtils");
const { asyncHandler } = require("../../helpers/asyncHandler");

// Authentication
router.use(authenticationV2);

// Routes
router.get("", asyncHandler(commentController.getCommentsByParentId));
router.post("", asyncHandler(commentController.createComment));
router.delete("", asyncHandler(commentController.deleteComment));

// Export router
module.exports = router;
