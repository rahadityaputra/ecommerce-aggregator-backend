const axios = require("axios");
const env = require("../../config/env");

const MARKETPLACE_BASE_URLS = {
    shopee: env.marketplaces.shopee,
    tokopedia: env.marketplaces.tokopedia,
    lazada: env.marketplaces.lazada,
};

function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        return baseUrl;
    }

    if (/^https?:\/\//i.test(baseUrl)) {
        return baseUrl;
    }

    return `http://${baseUrl}`;
}

class MarketplaceAdapterService {
    constructor() {
        this.clients = new Map();
    }

    getBaseUrl(marketplace) {
        const baseUrl = MARKETPLACE_BASE_URLS[marketplace];

        if (!baseUrl) {
            throw new Error(
                `Marketplace base URL is not configured for ${marketplace}`,
            );
        }

        return normalizeBaseUrl(baseUrl);
    }

    getClient(marketplace) {
        if (this.clients.has(marketplace)) {
            return this.clients.get(marketplace);
        }

        const client = axios.create({
            baseURL: this.getBaseUrl(marketplace),
            timeout: env.marketplaceSyncTimeoutMs,
            headers: {
                "Content-Type": "application/json",
                "X-Internal-Secret": env.internalApiKey,
            },
        });

        this.clients.set(marketplace, client);
        return client;
    }

    async request(marketplace, method, url, data) {
        const client = this.getClient(marketplace);

        try {
            const response = await client.request({
                method,
                url,
                data,
            });

            return {
                status: response.status,
                data: response.data,
            };
        } catch (error) {
            const wrappedError = new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Marketplace request failed",
            );

            wrappedError.marketplace = marketplace;
            wrappedError.status = error.response?.status || 502;
            wrappedError.requestPayload = data;
            wrappedError.responsePayload = error.response?.data || null;

            throw wrappedError;
        }
    }

    createProduct(marketplace, payload) {
        return this.request(marketplace, "POST", "/products", payload);
    }

    updateProduct(marketplace, marketplaceProductId, payload) {
        return this.request(
            marketplace,
            "PATCH",
            `/products/${marketplaceProductId}`,
            payload,
        );
    }

    updateStock(marketplace, marketplaceProductId, payload) {
        return this.request(
            marketplace,
            "PATCH",
            `/products/${marketplaceProductId}/stock`,
            payload,
        );
    }

    archiveProduct(marketplace, marketplaceProductId) {
        return this.request(
            marketplace,
            "DELETE",
            `/products/${marketplaceProductId}`,
        );
    }
}

module.exports = new MarketplaceAdapterService();
