const Redis = require("redis");

class RedisPubSubService {
    constructor() {
        // Tạo Redis client
        this.subscriber = Redis.createClient();
        this.publisher = Redis.createClient();

        // Xử lý lỗi
        this.subscriber.on("error", (err) => console.error("Subscriber error:", err));
        this.publisher.on("error", (err) => console.error("Publisher error:", err));

        // Kết nối client
        this.connect();
    }

    async connect() {
        try {
            // Kết nối subscriber nếu chưa mở
            if (!this.subscriber.isOpen) {
                await this.subscriber.connect();
                console.log("Subscriber connected successfully.");
            }

            // Kết nối publisher nếu chưa mở
            if (!this.publisher.isOpen) {
                await this.publisher.connect();
                console.log("Publisher connected successfully.");
            }
        } catch (err) {
            console.error("Failed to connect to Redis:", err);
        }
    }

    async publish(channel, message) {
        try {
            if (!this.publisher.isOpen) {
                console.warn("Publisher not connected. Reconnecting...");
                await this.publisher.connect();
            }
            await this.publisher.publish(channel, message);
            console.log(`Message published to channel "${channel}": ${message}`);
        } catch (err) {
            console.error("Failed to publish message:", err);
        }
    }

    async subscribe(channel, callback) {
        try {
            if (!this.subscriber.isOpen) {
                console.warn("Subscriber not connected. Reconnecting...");
                await this.subscriber.connect();
            }
            await this.subscriber.subscribe(channel, (message) => {
                callback(channel, message);
            });
            console.log(`Subscribed to channel "${channel}".`);
        } catch (err) {
            console.error("Failed to subscribe to channel:", err);
        }
    }
}

module.exports = new RedisPubSubService();
