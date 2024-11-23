"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");

const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const order = require("../models/order.model");

class CheckoutService {
    static async checkoutReview({ cartId, userId, shop_order_ids = [] }) {
        // check cart tồn tại không?
        const foundCart = await findCartById(cartId);
        if (!foundCart) throw new BadRequestError("Cart does not exist!");

        const checkout_order = {
                totalPrice: 0, // tổng tiền hàng
                feeShip: 0, // phí vận chuyển
                totalDiscount: 0, // tổng tiền discount giảm giá
                totalCheckout: 0, // tổng thanh toán
            },
            shop_order_ids_new = [];

        // tính tổng tiền bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = 0, item_products = [] } = shop_order_ids[i];

            // check product available
            const checkProductServer = await checkProductByServer(item_products);
            console.log("checkProductServer::", checkProductServer);
            if (!checkProductServer) throw new BadRequestError("Order wrong!!!");

            // tính tổng đơn hàng
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            // tổng tiền trước khi xử lý
            checkout_order.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tiền trước khi giảm giá
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };

            if (shop_discounts.length > 0) {
                // Check if there are applicable discounts
                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer,
                });

                // Add the discount amount to the total discount
                checkout_order.totalDiscount += discount;

                // If the discount amount is greater than 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }

            // Calculate the final total for checkout
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }

    static async orderByUser(shop_order_ids, cartId, userId, user_address = {}, user_payment = {}) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview(
            cartId,
            userId,
            shop_order_ids,
        );

        // Check lại một lần nữa xem vượt tồn kho hay không
        // Get new array Products
        const products = shop_order_ids_new.flatMap((order) => order.item_products);
        console.log("[1]:", products);
        const acquireProduct = [];

        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);

            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        // Check if có một sản phẩm hết hàng trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError("Một số sản phẩm đã được cập nhật, vui lòng quay lại giỏ hàng...");
        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
        });

        // Trường hợp: nếu insert thành công, thì remove product có trong cart
        if (newOrder) {
            // Remove product in my cart
        }

        return newOrder;
    }

    /**
     * Query Orders [Users]
     */
    static async getOrdersByUser() {
        // Implement logic to fetch all orders for a user
    }

    /**
     * Query Order Using Id [Users]
     */
    static async getOneOrderByUser() {
        // Implement logic to fetch a specific order by ID for a user
    }

    /**
     * Cancel Order [Users]
     */
    static async cancelOrderByUser() {
        // Implement logic to cancel an order for a user
    }

    /**
     * Update Order Status [Shop | Admin]
     */
    static async updateOrderStatusByShop() {
        // Implement logic to update order status by shop or admin
    }
}

module.exports = CheckoutService;
