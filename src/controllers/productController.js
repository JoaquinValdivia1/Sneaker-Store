import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = {
      isActive: true
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = {
        $search: search
      };
    }

    const products = await Product.find(filter).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      total: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener productos"
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Identificador de producto inválido"
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Producto registrado correctamente",
      product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo registrar el producto",
      error: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Producto actualizado correctamente",
      product
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo actualizar el producto",
      error: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Producto eliminado correctamente"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "No se pudo eliminar el producto"
    });
  }
};