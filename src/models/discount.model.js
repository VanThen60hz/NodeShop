const mongoose = require("mongoose");
const { Schema } = mongoose;

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
const discountSchema = new Schema(
    {
        discount_name: { type: String, required: true }, // tên discount
        discount_description: { type: String, required: true }, // mô tả discount
        discount_type: { type: String, default: "fixed_amount", enum: ["fixed_amount", "percentage"] }, // loại discount
        discount_value: { type: Number, required: true }, // 100.000, 10
        discount_code: { type: String, required: true }, // mã discountCode
        discount_start_date: { type: Date, required: true }, // ngày bắt đầu
        discount_end_date: { type: Date, required: true }, // ngày kết thúc
        discount_max_uses: { type: Number, required: true }, // số lượng discount được áp dụng
        discount_uses_count: { type: Number, required: true }, // số discount đã sử dụng
        discount_users_used: { type: Array, default: [] }, // ai đã sử dụng
        discount_max_uses_per_user: { type: Number, required: true }, // số lượng cho phép tối đa cho 1 user
        discount_min_order_value: { type: Number, required: true }, // giá trị đơn hàng tối thiểu
        discount_shopId: { type: Schema.Types.ObjectId, ref: "Shop" }, // liên kết với shop

        discount_is_active: { type: Boolean, default: true }, // trạng thái kích hoạt
        discount_applies_to: { type: String, required: true, enum: ["all", "specific"] }, // loại áp dụng
        discount_product_ids: { type: Array, default: [] }, // sản phẩm được áp dụng
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    },
);

// Export the model
module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);
