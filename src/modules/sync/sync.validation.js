const { z } = require('zod');

const retrySyncSchema = z.object({
  params: z.object({
    syncLogId: z.string().regex(/^[a-fA-F0-9]{24}$/)
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
});

const triggerStockSyncSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/)
  }),
  query: z.object({}).optional(),
  body: z.object({}).optional()
});

module.exports = {
  retrySyncSchema,
  triggerStockSyncSchema
};