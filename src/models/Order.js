import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0.01
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0.01
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: items => items.length > 0,
        message: "La orden debe contener productos"
      }
    },
    shippingAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    },
    total: {
      type: Number,
      required: true,
      min: 0.01
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"],
      default: "confirmed"
    },
    returnStatus: {
      type: String,
      enum: ["not_requested", "requested", "approved", "rejected", "completed"],
      default: "not_requested"
    },
    returnReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    returnedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export default mongoose.model("Order", orderSchema);