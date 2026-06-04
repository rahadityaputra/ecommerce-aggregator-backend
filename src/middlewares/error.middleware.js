const logger = require("../utils/logger");
const { fail } = require("../utils/response");

const SENSITIVE_KEYS = new Set([
    "password",
    "oldPassword",
    "newPassword",
    "confirmPassword",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "internalSecret",
    "xInternalSecret",
    "authorization",
]);

function sanitizeForLog(value) {
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeForLog(item));
    }

    if (!value || typeof value !== "object") {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, entryValue]) => {
            if (SENSITIVE_KEYS.has(key)) {
                return [key, "[REDACTED]"];
            }

            return [key, sanitizeForLog(entryValue)];
        }),
    );
}

function getLogLevel(statusCode) {
    if (statusCode >= 500) {
        return "error";
    }

    if (statusCode >= 400) {
        return "warn";
    }

    return "info";
}

function errorMiddleware(err, req, res, _next) {
    const statusCode = err.statusCode || 500;
    const logLevel = getLogLevel(statusCode);
    const errorContext = {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        message: err.message,
        errorName: err.name,
        userId: req.user?.id,
        params: sanitizeForLog(req.params),
        query: sanitizeForLog(req.query),
        body: sanitizeForLog(req.body),
        details: sanitizeForLog(err.details),
    };

    if (statusCode >= 500) {
        errorContext.stack = err.stack;
    }

    logger[logLevel](errorContext, "REST API request failed");

    return fail(
        res,
        statusCode,
        err.message || "Internal Server Error",
        err.details || undefined,
    );
}

module.exports = errorMiddleware;
