import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";

const products = [
  {
    name: "Air Max Pulse",
    brand: "Nike",
    model: "Pulse",
    description: "Zapatillas deportivas con diseño moderno y gran comodidad.",
    category: "running",
    price: 459.90,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
    variants: [
      { size: 38, color: "Rojo", stock: 10, sku: "NIKE-PULSE-38" },
      { size: 39, color: "Rojo", stock: 8, sku: "NIKE-PULSE-39" },
      { size: 40, color: "Rojo", stock: 12, sku: "NIKE-PULSE-40" }
    ]
  },
  {
    name: "Ultraboost Light",
    brand: "Adidas",
    model: "Ultraboost Light",
    description: "Zapatillas ideales para correr y entrenar.",
    category: "running",
    price: 529.90,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700",
    variants: [
      { size: 38, color: "Negro", stock: 7, sku: "ADIDAS-ULTRA-38" },
      { size: 39, color: "Negro", stock: 9, sku: "ADIDAS-ULTRA-39" },
      { size: 40, color: "Negro", stock: 10, sku: "ADIDAS-ULTRA-40" }
    ]
  },
  {
    name: "Classic Leather",
    brand: "Reebok",
    model: "Classic Leather",
    description: "Zapatillas casuales para el uso diario.",
    category: "casual",
    price: 299.90,
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=700",
    variants: [
      { size: 38, color: "Blanco", stock: 5, sku: "REEBOK-CLASSIC-38" },
      { size: 39, color: "Blanco", stock: 6, sku: "REEBOK-CLASSIC-39" },
      { size: 40, color: "Blanco", stock: 8, sku: "REEBOK-CLASSIC-40" }
    ]
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const names = products.map(product => product.name);

    await Product.deleteMany({
      name: { $in: names }
    });

    const createdProducts = await Product.insertMany(products);

    console.log(`${createdProducts.length} productos registrados correctamente.`);
  } catch (error) {
    console.error("Error al registrar productos:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();
