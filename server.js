// const { notify } = require("./src/app");
const app = require("./src/app");

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`NodeShop server is running on port ${PORT}`);
});

// process.on("SIGINT", () => {
//     server.close(() => {
//         console.log("NodeShop server is closed");
//     });
//    notify.send("ping...");
// });
