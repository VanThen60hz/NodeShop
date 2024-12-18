"use strict";

const express = require("express");
const inventoryController = require("../../controllers/inventory.controller");
const router = express.Router();
const { authenticationV2 } = require("../../auth/authUtils");
const { asyncHandler } = require("../../helpers/asyncHandler");

router.use(authenticationV2);
router.post("", asyncHandler(inventoryController.addStockToInventory));

module.exports = router;
