"use strict";

const { product, clothing, electronic, furniture } = require("../product.model");
const { Types } = require("mongoose");
const { isValid } = Types.ObjectId;
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require("../../utils");

const findAllDraftsForShop = async ({ query, limit = 50, skip = 0 }) => {
    return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit = 50, skip = 0 }) => {
    return await queryProduct({ query, limit, skip });
};

const searchProduct = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);
    const result = await product
        .find(
            {
                isPublished: true,
                $text: { $search: regexSearch },
            },
            { score: { $meta: "textScore" } },
        )
        .sort({ score: { $meta: "textScore" } })
        .lean();
    return result;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
    if (!isValid(product_shop) || !isValid(product_id)) {
        throw new Error("Invalid ObjectId");
    }

    const foundShop = await product.findOne({
        product_shop,
        _id: product_id,
    });

    if (!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPublished = true;

    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    if (!isValid(product_shop) || !isValid(product_id)) {
        throw new Error("Invalid ObjectId");
    }

    const foundShop = await product.findOne({
        product_shop,
        _id: product_id,
    });

    if (!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;

    const { modifiedCount } = await foundShop.updateOne(foundShop);
    return modifiedCount;
};

const updateProductById = async ({ productId, bodyUpdate, model, isNew = true }) => {
    return await model.findByIdAndUpdate(productId, bodyUpdate, { new: isNew });
};

const queryProduct = async ({ query, limit = 50, skip = 0 }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id")
        .sort({ updateAt: -1 })
        .limit(limit)
        .lean();
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();
    return products;
};

const findProductById = async ({ product_id, unSelect }) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect)).lean();
};

const getProductById = async (productId) => {
    const convertedId = convertToObjectIdMongodb(productId);
    return await product.findOne({ _id: convertedId }).lean();
};

module.exports = {
    findAllDraftsForShop,
    findAllPublishForShop,
    searchProduct,
    publishProductByShop,
    unPublishProductByShop,
    findAllProducts,
    findProductById,
    updateProductById,
    getProductById,
};
