import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = user => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      algorithm: "HS256"
    }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "El correo electrónico ya está registrado"
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password
    });

    return res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      token: generateToken(user),
      user
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "El correo electrónico ya está registrado"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al registrar usuario"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son obligatorios"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas"
      });
    }

    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      token: generateToken(user),
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión"
    });
  }
};

export const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};