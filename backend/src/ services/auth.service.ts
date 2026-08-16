import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { ENV } from "../config/env.js";

export class AuthService {
  static async signup(username: string, email: string, password: string) {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      throw new Error("User with this email or username already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return { id: user._id, username: user.username, email: user.email };
  }

  static async signin(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new Error("Invalid credentials");

    if (!user.password) {
      throw new Error("User password is missing");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, email: user.email },
      ENV.JWT_SECRET,
      {
        expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      },
    );

    return {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    };
  }
}
