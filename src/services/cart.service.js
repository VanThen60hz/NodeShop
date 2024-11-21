"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");

const cart = require("../models/cart.model");
const { getProductById } = require("../models/repositories/product.repo");

/**
 * Key features: Cart Service
 * - Add product to cart [User]
 * - Reduce product quantity by one [User]
 * - Increase product quantity by one [User]
 * - Get cart [User]
 * - Delete cart [User]
 * - Delete cart item [User]
 */

class CartService {
    // START REPO CART
    static async createUserCart({ userId, product }) {
        const query = { cart_userId: userId, cart_state: "active" };
        const updateOrInsert = {
            $addToSet: {
                cart_products: product,
            },
        };
        const options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateOrInsert, options);
    }
    // END REPO CART

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product;
        const query = {
            cart_userId: userId,
            "cart_products.productId": productId,
            cart_state: "active",
        };
        const updateSet = {
            $inc: {
                "cart_products.$.quantity": quantity,
            },
        };
        const options = { upsert: true, new: true };

        return await cart.findOneAndUpdate(query, updateSet, options);
    }

    static async addToCart({ userId, product = {} }) {
        // Check if cart exists
        const userCart = await cart.findOne({ cart_userId: userId });
        if (!userCart) {
            // Create a cart for the user
            return await CartService.createUserCart({ userId, product });
        }

        // If cart exists but has no products
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product];
            return await userCart.save();
        }

        // If cart exists and the product is already in the cart, update quantity
        // Logic for updating quantity goes here

        await CartService.updateUserCartQuantity({ userId, product });
    }

    static async addToCartV2({ userId, shop_order_ids }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0];

        // Check product existence
        const foundProduct = await getProductById(productId);
        if (!foundProduct) {
            throw new NotFoundError("Product not found");
        }

        // Compare product shop ID
        if (foundProduct.product_shop._id.toString() !== shop_order_ids[0]?.shopId) {
            throw new NotFoundError("Product does not belong to the shop");
        }

        if (quantity === 0) {
            // Handle product deletion logic here (if needed)
        }

        // Update cart
        return await CartService.updateUserCartQuantity({
            userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }

    static async deleteUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: "active" };
        const updateSet = {
            $pull: {
                cart_products: {
                    productId,
                },
            },
        };

        const deleteCart = await cart.updateOne(query, updateSet);
        return deleteCart;
    }

    static async getListUserCart({ userId }) {
        return await cart
            .findOne({
                cart_userId: +userId,
            })
            .lean();
    }
}

module.exports = CartService;
