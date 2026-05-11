import { client } from "../../db/redis.db";
import { BadRequestError, NotFoundError } from "../index";

export class RedisService {

  // ─── Token Revocation ────────────────────────────────────────────────────────

  async revokeToken(token: string, ttlSeconds: number): Promise<void> {
    try {
      await client.set(`revoked:${token}`, "1", { EX: ttlSeconds });
    } catch (error: any) {
      throw new BadRequestError(`Revoke token error: ${error.message}`);
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const result = await client.get(`revoked:${token}`);
      return result !== null;
    } catch (error: any) {
      throw new BadRequestError(`Check revoked token error: ${error.message}`);
    }
  }

  // ─── Password Attempts ───────────────────────────────────────────────────────

  async incrementLoginAttempts(email: string): Promise<number> {
    try {
      const key = `login_attempts:${email}`;
      const attempts = await client.incr(key);
      if (attempts === 1) {
        await client.expire(key, 15 * 60); // 15 min window
      }
      return attempts;
    } catch (error: any) {
      throw new BadRequestError(`Increment attempts error: ${error.message}`);
    }
  }

  async getLoginAttempts(email: string): Promise<number> {
    try {
      const result = await client.get(`login_attempts:${email}`);
      return result ? parseInt(result) : 0;
    } catch (error: any) {
      throw new BadRequestError(`Get attempts error: ${error.message}`);
    }
  }

  async resetLoginAttempts(email: string): Promise<void> {
    try {
      await client.del(`login_attempts:${email}`);
    } catch (error: any) {
      throw new BadRequestError(`Reset attempts error: ${error.message}`);
    }
  }

  async isAccountLocked(email: string, maxAttempts: number = 5): Promise<boolean> {
    try {
      const attempts = await this.getLoginAttempts(email);
      return attempts >= maxAttempts;
    } catch (error: any) {
      throw new BadRequestError(`Check lock error: ${error.message}`);
    }
  }

  // ─── OTP ─────────────────────────────────────────────────────────────────────

  async storeOtp(identifier: string, otp: string, ttlSeconds: number = 5 * 60): Promise<void> {
    try {
      await client.set(`otp:${identifier}`, otp, { EX: ttlSeconds });
    } catch (error: any) {
      throw new BadRequestError(`Store OTP error: ${error.message}`);
    }
  }

  async verifyOtp(identifier: string, otp: string): Promise<boolean> {
    try {
      const stored = await client.get(`otp:${identifier}`);
      if (!stored) throw new NotFoundError("OTP");
      const isValid = stored === otp;
      if (isValid) await client.del(`otp:${identifier}`);
      return isValid;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError(`Verify OTP error: ${error.message}`);
    }
  }

  async deleteOtp(identifier: string): Promise<void> {
    try {
      await client.del(`otp:${identifier}`);
    } catch (error: any) {
      throw new BadRequestError(`Delete OTP error: ${error.message}`);
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await client.set(key, value, { EX: ttlSeconds });
      } else {
        await client.set(key, value);
      }
    } catch (error: any) {
      throw new BadRequestError(`Set error: ${error.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await client.get(key);
    } catch (error: any) {
      throw new BadRequestError(`Get error: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await client.del(key);
    } catch (error: any) {
      throw new BadRequestError(`Delete error: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error: any) {
      throw new BadRequestError(`Exists error: ${error.message}`);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await client.ttl(key);
    } catch (error: any) {
      throw new BadRequestError(`TTL error: ${error.message}`);
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await client.incr(key);
    } catch (error: any) {
      throw new BadRequestError(`Increment error: ${error.message}`);
    }
  }
}

export const redisService = new RedisService();
