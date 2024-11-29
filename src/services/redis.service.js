const redis = require("redis");

const { reservationInventory } = require("../models/repositories/inventory.repo");

// Tạo Redis client
const redisClient = redis.createClient();

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
    await redisClient.connect(); // Kết nối Redis client
})();

// Hàm acquireLock
const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000; // 3 seconds lock time

    for (let i = 0; i < retryTimes; i++) {
        // Thử tạo khóa
        const result = await redisClient.set(key, expireTime, {
            NX: true, // Chỉ đặt nếu key chưa tồn tại
            PX: expireTime, // Thời gian hết hạn (ms)
        });

        console.log("result::", result);
        if (result === "OK") {
            // Nếu đặt khóa thành công, thực hiện hành động với inventory
            const isReservation = await reservationInventory({
                productId,
                quantity,
                cartId,
            });

            if (isReservation.modifiedCount) {
                return key; // Trả về key nếu thành công
            }

            return null;
        } else {
            // Đợi trước khi thử lại
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    return null; // Trả về null nếu không thể đặt khóa
};

// Hàm releaseLock
const releaseLock = async (keyLock) => {
    return await redisClient.del(keyLock); // Xóa khóa
};

module.exports = {
    acquireLock,
    releaseLock,
};
