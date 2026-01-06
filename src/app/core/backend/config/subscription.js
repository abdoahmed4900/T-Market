const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  keys: {
    p256dh: String,
    auth: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SubscriptionSchema.index({ userId: 1, deviceId: 1, deviceType: 1 }, { unique: true });
module.exports = mongoose.model("Subscription", SubscriptionSchema);