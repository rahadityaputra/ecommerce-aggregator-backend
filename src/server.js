const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");
const { connectMongo, connectPrisma } = require("./config/database");
const { initSocket } = require("./websocket/socket");
const startWorkers = require("./modules/queues/queue.workers");

async function bootstrap() {
    await connectPrisma();
    await connectMongo();

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: { origin: env.corsOrigin },
    });

    initSocket(io);
    startWorkers();

    server.listen(env.port || 8080, () => {
        logger.info(`Server running on port ${env.port}`);
    });
}

bootstrap().catch((error) => {
    logger.error(error, "Failed to bootstrap application");
    process.exit(1);
});
