const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");
const { connectMongo, connectPrisma } = require("./config/database");
const { initSocket } = require("./websocket/socket");
const startWorkers = require("./modules/queues/queue.workers");

async function bootstrap() {
    const port = env.port || 8080;

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: { origin: env.corsOrigin },
    });

    initSocket(io);

    // Listen on port FIRST agar Cloud Run health check bisa lewat,
    // baru kemudian connect ke database dan start workers.
    await new Promise((resolve) => {
        server.listen(port, () => {
            logger.info(`Server running on port ${port}`);
            resolve();
        });
    });

    await connectPrisma();
    await connectMongo();

    startWorkers();

    logger.info("Bootstrap complete — all services connected.");
}

bootstrap().catch((error) => {
    logger.error(error, "Failed to bootstrap application");
    process.exit(1);
});
