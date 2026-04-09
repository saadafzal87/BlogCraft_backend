// src/types/index.ts
// Shared TypeScript types and interfaces used across the application

import { Document, Types } from "mongoose";

// ──────────────────────────────────────────────────
// User
// ──────────────────────────────────────────────────
export type UserRole = "admin" | "author";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  accessToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ──────────────────────────────────────────────────
// Post
// ──────────────────────────────────────────────────
export type PostStatus = "draft" | "published";

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  content: string; // JSON string of ContentBlock[] or plain text (legacy)
  author: Types.ObjectId;
  status: PostStatus;
  tags: string[];
  images: string[]; // Cloudinary public_ids for cleanup on delete
  createdAt: Date;
  updatedAt: Date;
}

// ──────────────────────────────────────────────────
// Comment
// ──────────────────────────────────────────────────
export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
}

// ──────────────────────────────────────────────────
// JWT Payload
// ──────────────────────────────────────────────────
export interface JWTPayload {
  id: string;
  role: UserRole;
  email: string;
}

// ──────────────────────────────────────────────────
// API response helpers
// ──────────────────────────────────────────────────
export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNext: boolean;
  hasPrev: boolean;
}
