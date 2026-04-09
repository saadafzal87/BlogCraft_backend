import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { JWTPayload } from "../types";


const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET!;
  const expiry = process.env.JWT_ACCESS_EXPIRES || "2h";
  return jwt.sign(payload, secret, { expiresIn: expiry } as jwt.SignOptions);
};

const generateRefreshToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  const expiry = process.env.JWT_REFRESH_EXPIRES || "7d";
  return jwt.sign(payload, secret, { expiresIn: expiry } as jwt.SignOptions);
};



export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, "Email already registered");
  }

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
    success: true,
    message: "Registration successful. Please log in.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload: JWTPayload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const accessTokenExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.accessToken = accessToken;
  user.accessTokenExpiresAt = accessTokenExpiresAt;
  user.refreshToken = refreshToken;
  user.refreshTokenExpiresAt = refreshTokenExpiresAt;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
    accessTokenExpiresAt
  });
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.body.refreshToken as string | undefined;

    if (!token) {
      throw new AppError(401, "No refresh token provided");
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!,
      ) as JWTPayload;
    } catch {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError(
        401,
        "User associated with this token no longer exists.",
      );
    }

    const payload: JWTPayload = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const accessTokenExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
    user.accessToken = newAccessToken;
    user.accessTokenExpiresAt = accessTokenExpiresAt;
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresAt,
    });
  },
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user?.id, {
    $set: {
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
    },
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new AppError(404, "User not found");

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});
