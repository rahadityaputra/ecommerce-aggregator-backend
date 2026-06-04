const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    processed: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'webhook_events'
  }
);

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
