import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { UserPayload } from "../types/index.js";

const isUserPayload = (value: unknown): value is UserPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("id" in value) || !("email" in value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.email === "string";
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ApiResponse.error(
      res,
      "Authentication token missing or invalid format",
      401,
    );
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    ApiResponse.error(res, "Authentication token missing", 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (!isUserPayload(decoded)) {
      ApiResponse.error(res, "Invalid token payload", 401);
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch {
    ApiResponse.error(res, "Invalid or expired token", 401);
  }
};
