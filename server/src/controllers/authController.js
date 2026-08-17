import bcrypt from "bcryptjs";
import database from "../config/db.js";
import jwt from "jsonwebtoken";

export async function register(request, response) {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response.status(400).json({
      message: "Name, email, and password are required.",
    });
  }

  if (password.length < 8) {
    return response.status(400).json({
      message: "Password must be at least 8 characters long.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await database.execute(
      `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [normalizedName, normalizedEmail, passwordHash],
    );

    return response.status(201).json({
      message: "User registered successfully.",
      user: {
        id: result.insertId,
        name: normalizedName,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration failed:", error.message);

    return response.status(500).json({
      message: "Unable to register user.",
    });
  }
}

export async function login(request, response) {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({
      message: "Email and password are required.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const [users] = await database.execute(
      `SELECT id, name, email, password_hash
       FROM users
       WHERE email = ?`,
      [normalizedEmail],
    );

    const user = users[0];

    if (!user) {
      return response.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return response.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return response.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return response.status(500).json({
      message: "Unable to log in.",
    });
  }
}

export async function getCurrentUser(request, response) {
  try {
    const [users] = await database.execute(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = ?`,
      [request.user.userId],
    );

    const user = users[0];

    if (!user) {
      return response.status(404).json({
        message: "User not found.",
      });
    }

    return response.status(200).json({ user });
  } catch (error) {
    console.error("Unable to get current user:", error.message);

    return response.status(500).json({
      message: "Unable to get current user.",
    });
  }
}
