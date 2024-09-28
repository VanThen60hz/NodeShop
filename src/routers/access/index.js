"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication, authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// sign up
router.post("/shop/signup", asyncHandler(accessController.signUp));

//login
router.post("/shop/login", asyncHandler(accessController.login));

// authentication
router.use(authentication);

router.post("/shop/logout", asyncHandler(accessController.logout));

// authenticationV2
router.post("/shop/refresh-token", asyncHandler(accessController.handlerRefreshToken));

module.exports = router;
