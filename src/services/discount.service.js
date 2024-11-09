"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");

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
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type_value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
        } = payload;

        // Check for valid date range
        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("Start date must be before end date");
        }

        // Create index for discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (foundDiscount && foundDiscount.is_active) {
            throw new BadRequestError("Discount exists!");
        }

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

    static async getDiscountAmount(codeId, userId, shopId, products) {
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
        } = foundDiscount;

        if (!discount_is_active) throw new NotFoundError("Discount expired!");
        if (discount_max_uses <= 0) throw new NotFoundError("Discount uses are out!");

        const currentDate = new Date();
        if (currentDate < new Date(discount_start_date) || currentDate > new Date(discount_end_date)) {
            throw new NotFoundError("Discount code has expired!");
        }

        if (discount_min_order_value > 0) {
            const totalOrder = products.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`Discount requires a minimum order value of ${discount_min_order_value}`);
            }
        }

        if (discount_max_uses_per_user > 0) {
            const userDiscount = discount_users_used.find((user) => user.userId === userId);
            if (userDiscount) {
                if (userDiscount.uses >= discount_max_uses_per_user) {
                    throw new NotFoundError("Discount uses are out!");
                }
            }
        }

        const amount = discount_type === "fixed_amount" ? discount_value : (discount_value / 100) * totalOrder;

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }
}

module.exports = DiscountService;
