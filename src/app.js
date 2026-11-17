import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

app.use(helmet());

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API de Sneaker Store funcionando correctamente"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Ruta no encontrada"
  });
});

app.use((err, req, res, next) => {
  console.error("Error del servidor:", err.message);

  return res.status(err.status || 500).json({
    success: false,
    message: "Ocurrió un error en el servidor"
  });
});

export default app;