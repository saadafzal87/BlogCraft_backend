import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";
import User from "../models/User";

const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, message: "No token provided. Access denied." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret) as JWTPayload;


    const user = await User.findById(decoded.id).select("+accessToken");

    if (!user || user.accessToken !== token) {
      res
        .status(401)
        .json({
          success: false,
          message: "Session expired or logged in from another device.",
        });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res
        .status(401)
        .json({
          success: false,
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      return;
    }
    res
      .status(401)
      .json({ success: false, message: "Invalid token. Access denied." });
  }
};

export default protect;
