const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema(
  {
    productId: { type: Number, default: null, index: true },
    marketplace: { type: String, required: true },
    action: { type: String, required: true },
    requestPayload: { type: mongoose.Schema.Types.Mixed, default: null },
    responsePayload: { type: mongoose.Schema.Types.Mixed, default: null },
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILED', 'PENDING']
    },
    errorMessage: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false,
    collection: 'sync_logs',
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
    }
  }
);

module.exports = mongoose.model('SyncLog', syncLogSchema);
