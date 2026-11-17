import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  requestReturn,
  processReturn,
  updateOrderStatus
} from "../controllers/orderController.js";
import {
  protect,
  adminOnly
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.post("/:id/return", protect, requestReturn);

router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:id/return", protect, adminOnly, processReturn);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;