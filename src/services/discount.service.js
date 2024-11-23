"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const { checkDiscountExists } = require("../models/repositories/discount.repo");

// Discount Services
// 1 - Generate Discount Code [Shop | Admin]
// 2 - Get discount amount [User]
// 3 - Get all discount codes [User | Shop]
// 4 - Verify discount code [User]
// 5 - Delete discount code [Admin | Shop]
// 6 - Cancel discount code [User]

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            users_used,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
        } = payload;

        // Validate input types
        if (typeof code !== "string") {
            throw new BadRequestError("Discount code must be a string.");
        }
        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Start date must be before end date.");
        }

        // Check if the discount already exists
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (foundDiscount && foundDiscount.is_active) {
            throw new BadRequestError("Discount already exists!");
        }

        // Create new discount
        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscountCode() {
        // Code for updating discount code goes here...
    }

    /*
     * Get all discount codes available with products
     */
    static async getAllDiscountCodesWithProduct({ code, shopId, userId, limit, page }) {
        // Find the discount code and ensure it is active
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError("Discount not exists!");
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;

        if (discount_applies_to === "all") {
            // Get all products for the shop if discount applies to all products
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                page,
                limit,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        if (discount_applies_to === "specific") {
            // Get only specified products if discount applies to specific products
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                page,
                limit,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        // Return the list of products
        return products;
    }

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesUnSelect({
            limit,
            page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            unSelect: ["__v", "discount_shopId"],
            model: discount,
        });

        return discounts;
    }

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        console.log("getDiscountAmount::", codeId, userId, shopId, products);
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (!foundDiscount) throw new NotFoundError("Discount does not exist!");

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_start_date,
            discount_end_date,
            discount_users_used,
            discount_type,
            discount_value,
            discount_max_uses_per_user,
        } = foundDiscount;

        if (!discount_is_active) throw new NotFoundError("Discount expired!");
        if (discount_max_uses <= 0) throw new NotFoundError("Discount uses are out!");

        const currentDate = new Date();
        if (currentDate < new Date(discount_start_date) || currentDate > new Date(discount_end_date)) {
            throw new NotFoundError("Discount code has expired!");
        }

        // Calculate the total order amount
        const totalOrder = products.reduce((acc, product) => {
            return acc + product.quantity * product.price;
        }, 0);

        // Check minimum order value condition
        if (discount_min_order_value > 0 && totalOrder < discount_min_order_value) {
            throw new NotFoundError(`Discount requires a minimum order value of ${discount_min_order_value}`);
        }

        // Check if the user exceeded their maximum usage for the discount
        if (discount_max_uses_per_user > 0) {
            const userDiscount = discount_users_used.find((user) => user.userId === userId);
            if (userDiscount && userDiscount.uses >= discount_max_uses_per_user) {
                throw new NotFoundError("Discount uses are out for this user!");
            }
        }

        // Calculate the discount amount
        const discountAmount = discount_type === "fixed_amount" ? discount_value : (discount_value / 100) * totalOrder;

        return {
            totalOrder,
            discount: discountAmount,
            totalPrice: totalOrder - discountAmount,
        };
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId),
        });

        return deleted;
    }

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (!foundDiscount) throw new NotFoundError("discount doesn't exist");

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            },
        });

        return result;
    }
}

module.exports = DiscountService;
