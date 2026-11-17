import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !shippingAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar productos y dirección de envío"
      });
    }

    const consolidatedItems = new Map();

    for (const item of items) {
      const key = `${item.productId}-${item.variantId}`;
      const quantity = Number(item.quantity);

      if (
        !mongoose.isValidObjectId(item.productId) ||
        !mongoose.isValidObjectId(item.variantId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Los datos de los productos no son válidos"
        });
      }

      consolidatedItems.set(
        key,
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: (consolidatedItems.get(key)?.quantity || 0) + quantity
        }
      );
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      let total = 0;

      for (const item of consolidatedItems.values()) {
        const product = await Product.findOne({
          _id: item.productId,
          isActive: true
        }).session(session);

        if (!product) {
          throw new Error("Uno de los productos no está disponible");
        }

        const variant = product.variants.id(item.variantId);

        if (!variant) {
          throw new Error(`La variante de ${product.name} no existe`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}, talla ${variant.size}`);
        }

        variant.stock -= item.quantity;

        await product.save({ session });

        const subtotal = Number(
          (product.price * item.quantity).toFixed(2)
        );

        total += subtotal;

        orderItems.push({
          product: product._id,
          variantId: variant._id,
          productName: product.name,
          brand: product.brand,
          sku: variant.sku || "SIN-SKU",
          size: variant.size,
          color: variant.color,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal
        });
      }

      const [order] = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            shippingAddress: shippingAddress.trim(),
            total: Number(total.toFixed(2)),
            status: "confirmed"
          }
        ],
        { session }
      );

      createdOrder = order;
    });

    return res.status(201).json({
      success: true,
      message: "Compra realizada correctamente",
      order: createdOrder
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "No se pudo realizar la compra"
    });
  } finally {
    await session.endSession();
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    })
      .populate("items.product", "name brand image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener el historial de compras"
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name brand image")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener los pedidos"
    });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Debe indicar el motivo de la devolución"
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado"
      });
    }

    if (
      !["confirmed", "shipped", "delivered"].includes(order.status) ||
      order.returnStatus !== "not_requested"
    ) {
      return res.status(400).json({
        success: false,
        message: "Este pedido no admite una nueva solicitud de devolución"
      });
    }

    order.returnStatus = "requested";
    order.returnReason = reason.trim();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Solicitud de devolución enviada",
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al solicitar la devolución"
    });
  }
};

export const processReturn = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { decision } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "La decisión debe ser approved o rejected"
      });
    }

    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        throw new Error("Pedido no encontrado");
      }

      if (order.returnStatus !== "requested") {
        throw new Error("El pedido no tiene una devolución pendiente");
      }

      if (decision === "rejected") {
        order.returnStatus = "rejected";
        await order.save({ session });
        updatedOrder = order;
        return;
      }

      for (const item of order.items) {
        const product = await Product.findById(item.product).session(session);

        if (!product) {
          throw new Error(`No se encontró el producto ${item.productName}`);
        }

        const variant = product.variants.id(item.variantId);

        if (!variant) {
          throw new Error(`No se encontró la variante de ${item.productName}`);
        }

        variant.stock += item.quantity;

        await product.save({ session });
      }

      order.returnStatus = "completed";
      order.status = "returned";
      order.returnedAt = new Date();

      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: decision === "approved"
        ? "Devolución aprobada y stock restaurado"
        : "Devolución rechazada",
      order: updatedOrder
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "No se pudo procesar la devolución"
    });
  } finally {
    await session.endSession();
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "confirmed",
      "shipped",
      "delivered",
      "cancelled"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Estado de pedido no válido"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado"
      });
    }

    if (["returned", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "No se puede modificar el estado de este pedido"
      });
    }

    if (status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Para cancelar un pedido se debe gestionar la devolución del stock"
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Estado del pedido actualizado",
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el pedido"
    });
  }
};