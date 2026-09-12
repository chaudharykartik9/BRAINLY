import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.js";
import { ENV } from "../config/env.js";
import { sendMail } from "../utils/mailer.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export class AuthService {
  private static signToken(user: IUser) {
    return jwt.sign(
      { id: String(user._id), email: user.email },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] },
    );
  }

  private static buildAuthResponse(user: IUser) {
    return {
      token: AuthService.signToken(user),
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
      },
    };
  }

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

    return AuthService.buildAuthResponse(user);
  }

  static async signin(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new Error("Invalid credentials");

    if (!user.password) {
      throw new Error("User password is missing");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return AuthService.buildAuthResponse(user);
  }

  /**
   * Issues a password-reset token for the given email, if an account exists.
   * Always resolves without error (never reveals whether the email is
   * registered) — the controller returns the same generic message either way.
   */
  static async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${ENV.FRONTEND_URL}/reset-password/${rawToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your Brainly password",
      text: `We received a request to reset your Brainly password. This link expires in 1 hour:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `
        <p>We received a request to reset your Brainly password.</p>
        <p><a href="${resetUrl}">Click here to choose a new password</a> — this link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  }

  static async resetPassword(rawToken: string, newPassword: string) {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      throw new Error("This reset link is invalid or has expired");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return AuthService.buildAuthResponse(user);
  }
}
