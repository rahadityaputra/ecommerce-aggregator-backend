const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const env = require("./config/env");
const setupSwagger = require("./config/swagger");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/notFound.middleware");

const app = express();

// Trust the first proxy (Cloud Run's load balancer) so that
// express-rate-limit can correctly read the real client IP
// from the X-Forwarded-For header.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use(morgan("dev"));
app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 200,
    }),
);

setupSwagger(app);
app.use(env.apiPrefix, routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
