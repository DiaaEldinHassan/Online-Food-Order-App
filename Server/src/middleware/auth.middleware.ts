import { Request, Response, NextFunction } from "express";
import { ERole, verifyToken, UnauthorizedError, ForbiddenError } from "../common";
import { redisService } from "../common/service";
import { User } from "../db";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authentication = (roles: ERole[] = [ERole.user, ERole.admin, ERole.driver]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("No token provided");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new UnauthorizedError("No token provided");
      }

      const isRevoked = await redisService.isTokenRevoked(token);
      if (isRevoked) {
        throw new UnauthorizedError("Token has been revoked");
      }

      const decoded = verifyToken(token);
      if (typeof decoded === "string") {
        throw new UnauthorizedError("Invalid token");
      }

      if (typeof decoded._id !== "string") {
        throw new UnauthorizedError("Invalid token payload");
      }

      const user = await User.findById(decoded._id).select("-password");
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const userRole = (user.role ?? "").toLowerCase();
      const hasRole = roles.some((r) => r.toLowerCase() === userRole);
      if (!hasRole) {
        throw new ForbiddenError("You do not have permission to access this resource");
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
