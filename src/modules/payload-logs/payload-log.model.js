const mongoose = require('mongoose');

const payloadLogSchema = new mongoose.Schema(
  {
    marketplace: { type: String, required: true },
    event: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    created_at: { type: Date, default: Date.now }
  },
  {
    versionKey: false,
    collection: 'payload_logs'
  }
);

module.exports = mongoose.model('PayloadLog', payloadLogSchema);
