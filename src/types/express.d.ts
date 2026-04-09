// src/types/express.d.ts
// Augment the Express Request interface to include the authenticated user
import { IUser } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "admin" | "author";
        email: string;
      };
    }
  }
}

export {};
