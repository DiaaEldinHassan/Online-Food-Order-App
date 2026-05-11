import { Request, Response, NextFunction } from "express";
import { redisService } from "../common/service";
import { AppNormalError } from "../common";

class TooManyRequestsError extends AppNormalError {
  constructor(retryAfter: number) {
    super(`Too many requests. Please try again in ${retryAfter} seconds.`, 429);
  }
}

interface RateLimitOptions {
  windowSec: number;
  max: number;
  prefix?: string;
}

export const rateLimit = (opts: RateLimitOptions) => {
  const { windowSec, max, prefix = "rl" } = opts;

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const ip = ((req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim())
      ?? req.socket.remoteAddress
      ?? "unknown";

    const key = `${prefix}:${ip}`;

    try {
      const current = await redisService.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= max) {
        const ttl = await redisService.ttl(key);
        return next(new TooManyRequestsError(ttl > 0 ? ttl : windowSec));
      }

      if (count === 0) {
        await redisService.set(key, "1", windowSec);
      } else {
        await redisService.increment(key);
      }

      next();
    } catch {
      next();
    }
  };
};


export const authLimiter = rateLimit({ windowSec: 15 * 60, max: 10, prefix: "rl:auth" });

export const otpLimiter = rateLimit({ windowSec: 10 * 60, max: 5, prefix: "rl:otp" });

export const apiLimiter = rateLimit({ windowSec: 60, max: 100, prefix: "rl:api" });

export const publicLimiter = rateLimit({ windowSec: 60, max: 200, prefix: "rl:public" });

export const adminLimiter = rateLimit({ windowSec: 60, max: 60, prefix: "rl:admin" });
