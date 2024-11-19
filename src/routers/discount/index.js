"use strict";

const express = require("express");
const discountController = require("../../controllers/discount.controller");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

// get amount of a discount
router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get("/list_product_code", asyncHandler(discountController.getAllDiscountCodesWithProducts));

// authentication
router.use(authenticationV2);

router.post("", asyncHandler(discountController.createDiscountCode));
router.get("", asyncHandler(discountController.getAllDiscountCodesWithProducts));

module.exports = router;
