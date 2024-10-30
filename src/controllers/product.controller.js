"use strict";

const productService = require("../services/product.service");
const productServiceV2 = require("../services/product.service.xxx");

const { SuccessResponse } = require("../core/success.response");

class ProductController {
    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: "Created new product successfully!",
        //     metadata: await productService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId,
        //     }),
        // }).send(res);

        new SuccessResponse({
            message: "Created new product successfully!",
            metadata: await productServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Updated product successfully!",
            metadata: await productServiceV2.updateProduct(req.body.product_type, req.params.productId, {
                ...req.body,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @desc Get all drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all drafts for shop successfully!",
            metadata: await productServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @desc Get all published products for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */
    getAllPublishedForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all published products for shop successfully!",
            metadata: await productServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    searchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Search product successfully!",
            metadata: await productServiceV2.getListSearchProduct(req.params),
        }).send(res);
    };

    /**
     * @desc Publish product by shop
     * @param {String} product_id
     * @return {JSON}
     */
    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Published product successfully!",
            metadata: await productServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @desc Unpublish product by shop
     * @param {String} product_id
     * @return {JSON}
     */
    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Unpublished product successfully!",
            metadata: await productServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @desc Find all products
     * @param {Number} limit
     * @param {String} sort
     * @param {Number} page
     * @param {Object} filter
     * @return {JSON}
     */
    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all products successfully!",
            metadata: await productServiceV2.findAllProducts(req.query),
        }).send(res);
    };

    /**
     * @desc Find product by id
     * @param {String} product_id
     * @return {JSON}
     */
    findProductById = async (req, res, next) => {
        new SuccessResponse({
            message: "Get product by id successfully!",
            metadata: await productServiceV2.findProductById({
                product_id: req.params.product_id,
            }),
        }).send(res);
    };
}

module.exports = new ProductController();
