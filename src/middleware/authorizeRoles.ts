import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";

const authorizeRoles =
  (...roles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: `Access denied. Requires one of: [${roles.join(", ")}]`,
        });
        return;
      }

      next();
    };

export default authorizeRoles;
