import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      required: true,
      min: 20,
      max: 50
    },
    color: {
      type: String,
      required: true,
      trim: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ["running", "casual", "basketball", "training", "football"]
    },
    price: {
      type: Number,
      required: true,
      min: 0.01
    },
    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: variants => variants.length > 0,
        message: "El producto debe tener al menos una variante"
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

productSchema.index({ name: "text", brand: "text", model: "text" });
productSchema.index({ category: 1, isActive: 1 });

export default mongoose.model("Product", productSchema);