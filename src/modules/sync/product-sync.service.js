const ApiError = require("../../utils/ApiError");
const logger = require("../../utils/logger");
const { emitEvent } = require("../../websocket/socket");
const mappingsRepository = require("../mappings/mappings.repository");
const marketplaceAdapter = require("./marketplace-adapter.service");
const syncLogService = require("./sync-log.service");
const {
    buildMarketplaceSku,
    buildMarketplaceProductPayload,
    buildMarketplaceStockPayload,
} = require("./marketplace-payload.transformer");

const MARKETPLACES = [
    { key: "shopee", name: "Shopee", code: "SHP" },
    { key: "tokopedia", name: "Tokopedia", code: "TOK" },
    { key: "lazada", name: "Lazada", code: "LZD" },
];

function getEventName(action) {
    if (action === "create") {
        return "product-created";
    }

    if (action === "stock") {
        return "stock-updated";
    }

    return "product-updated";
}

function getMarketplaceMethod(action) {
    if (action === "create") {
        return "createProduct";
    }

    if (action === "stock") {
        return "updateStock";
    }

    if (action === "archive") {
        return "archiveProduct";
    }

    return "updateProduct";
}

function extractMarketplaceProductId(responsePayload) {
    // Response shapes vary across marketplaces. Do a depth-first search
    // for common id keys: id, productId, product_id
    if (responsePayload === undefined || responsePayload === null) {
        return null;
    }

    const keyCandidates = new Set(["id", "productId", "product_id"]);

    const seen = new WeakSet();
    const stack = [responsePayload];

    while (stack.length) {
        const node = stack.pop();

        if (node && typeof node === "object") {
            if (seen.has(node)) continue;
            seen.add(node);

            for (const key of Object.keys(node)) {
                if (keyCandidates.has(key) && node[key] != null) {
                    return String(node[key]);
                }
            }

            for (const key of Object.keys(node)) {
                try {
                    const child = node[key];
                    if (child && typeof child === "object") {
                        stack.push(child);
                    }
                } catch (e) {
                    // ignore access errors
                }
            }
        }
    }

    return null;
}

async function findOrCreateMapping(product, marketplace) {
    const existingMapping =
        await mappingsRepository.findByProductIdAndMarketplace(
            product.id,
            marketplace.key,
        );

    if (existingMapping) {
        return existingMapping;
    }

    const marketplaceSku = buildMarketplaceSku(
        marketplace.key,
        product.internalSku,
    );

    return mappingsRepository.create({
        marketplace: marketplace.key,
        marketplaceSku,
        internalSku: product.internalSku,
        productId: product.id,
    });
}

function buildRequestPayload(action, product, marketplace, mapping) {
    if (action === "stock") {
        return buildMarketplaceStockPayload(product);
    }

    if (action === "archive") {
        return {
            product_id: product.id,
            internal_sku: product.internalSku,
            marketplace_sku: buildMarketplaceSku(
                marketplace.key,
                product.internalSku,
            ),
            status: "ARCHIVED",
        };
    }

    return buildMarketplaceProductPayload(
        product,
        mapping?.marketplaceSku ||
            buildMarketplaceSku(marketplace.key, product.internalSku),
    );
}

async function sendMarketplaceRequest(
    action,
    marketplace,
    mapping,
    requestPayload,
) {
    const method = getMarketplaceMethod(action);

    if (action === "create") {
        return marketplaceAdapter[method](marketplace.key, requestPayload);
    }

    if (!mapping.marketplaceProductId) {
        const error = new Error(
            `Marketplace product id is not available for ${marketplace.name}`,
        );
        error.requestPayload = requestPayload;
        throw error;
    }

    if (action === "archive") {
        return marketplaceAdapter[method](
            marketplace.key,
            mapping.marketplaceProductId,
        );
    }

    return marketplaceAdapter[method](
        marketplace.key,
        mapping.marketplaceProductId,
        requestPayload,
    );
}

async function syncSingleMarketplace({
    action,
    productId,
    product,
    marketplace,
    requestPayload: providedRequestPayload = null,
}) {
    let syncLog = null;

    try {
        const requestPayload =
            providedRequestPayload ||
            buildRequestPayload(action, product, marketplace, null);

        logger.info(
            {
                action,
                productId,
                marketplace: marketplace.name,
                internalSku: product.internalSku,
            },
            "Starting marketplace sync",
        );
        logger.debug(
            {
                action,
                productId,
                marketplace: marketplace.name,
                requestPayload,
            },
            "Marketplace sync request payload",
        );

        syncLog = await syncLogService.createPendingLog({
            productId,
            marketplace: marketplace.name,
            action,
            requestPayload,
        });

        logger.info(
            {
                syncLogId: syncLog.id,
                action,
                productId,
                marketplace: marketplace.name,
            },
            "Sync log created",
        );

        const mapping = await findOrCreateMapping(product, marketplace);

        logger.info(
            {
                action,
                productId,
                marketplace: marketplace.name,
                mappingId: mapping.id,
                marketplaceProductId: mapping.marketplaceProductId || null,
                marketplaceSku: mapping.marketplaceSku,
            },
            mapping.marketplaceProductId
                ? "Mapping loaded"
                : "Mapping created or missing marketplace product id",
        );

        logger.info(
            {
                action,
                productId,
                marketplace: marketplace.name,
                method: getMarketplaceMethod(action),
            },
            "Sending request to marketplace",
        );
        const response = await sendMarketplaceRequest(
            action,
            marketplace,
            mapping,
            requestPayload,
        );
        const responsePayload = response.data;
        const marketplaceProductId =
            extractMarketplaceProductId(responsePayload);

        logger.debug(
            {
                action,
                productId,
                marketplace: marketplace.name,
                responsePayload,
                extractedMarketplaceProductId: marketplaceProductId,
            },
            "Marketplace sync response received",
        );

        if (mapping && marketplaceProductId && !mapping.marketplaceProductId) {
            await mappingsRepository.updateById(mapping.id, {
                marketplaceProductId,
            });

            logger.info(
                {
                    action,
                    productId,
                    marketplace: marketplace.name,
                    mappingId: mapping.id,
                    marketplaceProductId,
                },
                "Mapping updated with marketplace product id",
            );
        }

        const savedLog = await syncLogService.markSuccess(
            syncLog.id,
            responsePayload,
        );

        logger.info(
            {
                action,
                productId,
                marketplace: marketplace.name,
                syncLogId: savedLog.id,
                marketplaceProductId:
                    marketplaceProductId ||
                    mapping?.marketplaceProductId ||
                    null,
            },
            "Marketplace sync success",
        );

        emitEvent("marketplace-sync-success", {
            productId,
            marketplace: marketplace.name,
            action,
            syncLogId: savedLog.id,
            marketplaceProductId:
                marketplaceProductId || mapping?.marketplaceProductId || null,
        });

        return {
            marketplace: marketplace.name,
            action,
            status: "SUCCESS",
            syncLogId: savedLog.id,
        };
    } catch (error) {
        logger.error(
            {
                action,
                productId,
                marketplace: marketplace.name,
                syncLogId: syncLog?.id || null,
                error: error.message,
                requestPayload:
                    error.requestPayload || providedRequestPayload || null,
                responsePayload: error.responsePayload || null,
            },
            "Marketplace sync failed",
        );

        const failedLog = syncLog
            ? await syncLogService.markFailed(
                  syncLog.id,
                  error.message,
                  error.responsePayload || null,
              )
            : null;

        emitEvent("marketplace-sync-failed", {
            productId,
            marketplace: marketplace.name,
            action,
            syncLogId: failedLog?.id || syncLog?.id || null,
            error: error.message,
        });

        return {
            marketplace: marketplace.name,
            action,
            status: "FAILED",
            syncLogId: failedLog?.id || syncLog?.id || null,
            error: error.message,
        };
    }
}

async function syncProductMutation(action, product) {
    logger.info(
        {
            action,
            productId: product.id,
            internalSku: product.internalSku,
            marketplaces: MARKETPLACES.map((marketplace) => marketplace.name),
        },
        "Starting product mutation sync",
    );

    const results = await Promise.all(
        MARKETPLACES.map((marketplace) =>
            syncSingleMarketplace({
                action,
                productId: product.id,
                product,
                marketplace,
            }),
        ),
    );

    logger.info(
        {
            action,
            productId: product.id,
            results,
        },
        "Product mutation sync finished",
    );

    emitEvent(getEventName(action), {
        productId: product.id,
        internalSku: product.internalSku,
        stock: product.stock,
        action,
        results,
    });

    return results;
}

async function retrySyncLog(syncLogId) {
    logger.info({ syncLogId }, "Retrying marketplace sync log");

    const syncLog = await syncLogService.findById(syncLogId);

    if (!syncLog) {
        throw new ApiError(404, "Sync log not found");
    }

    const marketplace = MARKETPLACES.find(
        (item) =>
            item.name === syncLog.marketplace ||
            item.key === syncLog.marketplace,
    );

    if (!marketplace) {
        throw new ApiError(
            400,
            `Unsupported marketplace: ${syncLog.marketplace}`,
        );
    }

    const product = {
        id: syncLog.productId,
        internalSku: syncLog.requestPayload?.internal_sku,
        name: syncLog.requestPayload?.product_name,
        description: syncLog.requestPayload?.description,
        category: syncLog.requestPayload?.category,
        brand: syncLog.requestPayload?.brand,
        price: syncLog.requestPayload?.price,
        stock: syncLog.requestPayload?.stock,
        weight: syncLog.requestPayload?.weight,
        imageUrl: syncLog.requestPayload?.thumbnail_url,
        status: syncLog.requestPayload?.status,
        images: Array.isArray(syncLog.requestPayload?.images)
            ? syncLog.requestPayload.images.map((imageUrl) => ({ imageUrl }))
            : [],
    };

    const requestPayload =
        syncLog.action === "stock"
            ? buildMarketplaceStockPayload(product)
            : syncLog.action === "archive"
              ? null
              : syncLog.requestPayload;

    return syncSingleMarketplace({
        action: syncLog.action,
        productId: syncLog.productId,
        product,
        marketplace,
        requestPayload,
    });
}

module.exports = {
    syncProductMutation,
    retrySyncLog,
};
