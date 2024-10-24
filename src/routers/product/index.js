"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication, authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

router.get("/search/:keySearch", asyncHandler(productController.searchProduct));

// authentication
router.use(authenticationV2);

router.post("", asyncHandler(productController.createProduct));

router.put("/publish/:id", asyncHandler(productController.publishProductByShop));
router.put("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));

router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/published/all", asyncHandler(productController.getAllPublishedForShop));

module.exports = router;
