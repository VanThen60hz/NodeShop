"use strict";

const { product, clothing, electronic, furniture } = require("../models/product.model");

const { BadRequestError } = require("../core/error.response");
const {
    findAllDraftsForShop,
    findAllPublishForShop,
    searchProduct,
    publishProductByShop,
    unPublishProductByShop,
    findAllProducts,
    findProductById,
} = require("../models/repositories/product.repo");

class ProductFactory {
    static productRegistry = {};

    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid product type: ${type}`);
        return new productClass(payload).createProduct();
    }

    static publishProductByShop({ product_shop, product_id }) {
        return publishProductByShop({ product_shop, product_id });
    }

    static unPublishProductByShop({ product_shop, product_id }) {
        return unPublishProductByShop({ product_shop, product_id });
    }

    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftsForShop({ query, limit, skip });
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishForShop({ query, limit, skip });
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProduct({ keySearch });
    }

    static async findAllProducts({ limit = 50, sort = "ctime", page = 1, filter = { isPublished: true } }) {
        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select: [
                "product_name",
                "product_thumb",
                "product_description",
                "product_price",
                "product_quantity",
                "product_type",
                "product_shop",
                "product_attributes",
            ],
        });
    }

    static async findProductById({ product_id }) {
        return await findProductById({ product_id, unSelect: ["__v"] });
    }

    // static async  updateProductById({ product_id, product_shop, product_attributes }) {
    //     return await
    // }
}

class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }
}

class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes);
        if (!newClothing) {
            throw new BadRequestError("Failed to create clothing");
        }

        const newProduct = await super.createProduct();

        return newProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic) {
            throw new BadRequestError("Failed to create electronic");
        }

        const newProduct = await super.createProduct(newElectronic._id);

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture) {
            throw new BadRequestError("Failed to create furniture");
        }

        const newProduct = await super.createProduct();

        return newProduct;
    }
}

// register product type
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
