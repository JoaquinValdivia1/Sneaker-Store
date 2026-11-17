import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Administrador";

    if (!email || !password || password.length < 8) {
      throw new Error("Configura ADMIN_EMAIL y ADMIN_PASSWORD en .env");
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.name = name;
      existingAdmin.password = password;
      existingAdmin.role = "admin";
      existingAdmin.isActive = true;

      await existingAdmin.save();
      console.log("Administrador actualizado correctamente.");
    } else {
      await User.create({
        name,
        email,
        password,
        role: "admin"
      });

      console.log("Administrador creado correctamente.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();