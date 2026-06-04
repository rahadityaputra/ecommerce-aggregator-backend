const dotenv = require("dotenv");

dotenv.config();

/**
 * Requires an environment variable to be set.
 * Throws an error if the variable is missing in production to prevent
 * the app from running silently with insecure default values.
 */
function requireEnv(key) {
    const val = process.env[key];
    if (!val && process.env.NODE_ENV === "production") {
        throw new Error(
            `[env] Environment variable "${key}" is required in production but was not set. ` +
            `Please add it via Cloud Run --set-secrets or --set-env-vars.`
        );
    }
    return val;
}

const env = {
    nodeEnv:    process.env.NODE_ENV || "development",
    port:       Number(process.env.PORT || 4000),
    apiPrefix:  process.env.API_PREFIX || "/api/v1",

    // --- Database (wajib di production, diisi via Secret Manager) ---
    mysqlUrl:   requireEnv("MYSQL_URL"),
    mongoUrl:   requireEnv("MONGO_URL"),

    // --- Redis ---
    redisHost:  process.env.REDIS_HOST || "localhost",
    redisPort:  Number(process.env.REDIS_PORT || 6379),

    // --- Auth (wajib di production, diisi via Secret Manager) ---
    jwtSecret:      requireEnv("JWT_SECRET"),
    jwtExpiresIn:   process.env.JWT_EXPIRES_IN || "1d",

    // --- App ---
    corsOrigin: process.env.CORS_ORIGIN || "*",
    logLevel:   process.env.LOG_LEVEL || "info",
    marketplaceSyncTimeoutMs: Number(
        process.env.MARKETPLACE_SYNC_TIMEOUT_MS || 5000,
    ),

    // --- Internal API (wajib di production, diisi via Secret Manager) ---
    internalApiKey: requireEnv("INTERNAL_API_KEY"),

    // --- GCP Storage ---
    gcpBucketName: process.env.GCP_BUCKET_NAME || "synchub-bucket",

    // --- Marketplace Base URLs ---
    marketplaces: {
        shopee:     process.env.SHOPEE_MARKETPLACE_BASE_URL || "",
        tokopedia:  process.env.TOKOPEDIA_MARKETPLACE_BASE_URL || "",
        lazada:     process.env.LAZADA_MARKETPLACE_BASE_URL || "",
    },
};

module.exports = env;
