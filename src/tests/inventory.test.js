const redisPubSubService = require("../services/redisPubSub.service");

class InventoryServiceTest {
    constructor() {
        redisPubSubService.subscribe("purchase_events", (channel, message) => {
            console.log(`Received message from channel "${channel}": ${message}`);
            InventoryServiceTest.updateInventory(JSON.parse(message));
        });
    }

    static updateInventory({ productId, quantity }) {
        console.log(`[0001]: Updated inventory ${productId} with quantity ${quantity}`);
    }
}

module.exports = new InventoryServiceTest();
