import { HydratedDocument } from "mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";
import {
  BadRequestError, NotFoundError, UnauthorizedError,
  compareHash, generateTokens, DBService,
  IUser, IUserLog, IUserSignInReturn, IUserSignUpInput,
  encrypt, redisService, sendOtp,
} from "../../common";
import { User } from "../../db/models";

const MAX_ATTEMPTS = 5;
const LOCK_WINDOW   = 15 * 60;

class AuthService extends DBService<any> {
  constructor() {
    super(User);
  }

  async signIn(userData: IUserLog): Promise<IUserSignInReturn> {
    try {
      const locked = await redisService.isAccountLocked(userData.email, MAX_ATTEMPTS);
      if (locked) {
        const ttl = await redisService.ttl(`login_attempts:${userData.email}`);
        throw new UnauthorizedError(`Account locked. Try again in ${Math.ceil(ttl / 60)} minutes.`);
      }

      const user = await this.getBy({ email: userData.email });

      const isPasswordValid = await compareHash(user.password, userData.password);
      if (!isPasswordValid) {
        const attempts = await redisService.incrementLoginAttempts(userData.email);
        const remaining = MAX_ATTEMPTS - attempts;
        if (remaining <= 0) {
          throw new UnauthorizedError(`Account locked for ${LOCK_WINDOW / 60} minutes due to too many failed attempts.`);
        }
        throw new BadRequestError(`Invalid email or password. ${remaining} attempt(s) remaining.`);
      }

      await redisService.resetLoginAttempts(userData.email);

      const { accessToken, refreshToken } = generateTokens({
        _id: user._id,
        username: user.name,
        email: user.email,
        password: user.password,
        DOB: new Date(),
      } as IUser);

      return {
        message: "Sign in successful",
        accessToken,
        refreshToken,
        role: user.role,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        await redisService.incrementLoginAttempts(userData.email);
        throw new BadRequestError("Invalid email or password.");
      }
      throw error;
    }
  }

  async signOut(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;
      const ttl = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
      if (ttl > 0) {
        await redisService.revokeToken(token, ttl);
      }
    } catch (error: any) {
      throw new BadRequestError(`Sign out error: ${error.message}`);
    }
  }

  async signUp(userData: IUserSignUpInput): Promise<HydratedDocument<IUser>> {
    try {
      const encryptedPhone = userData.phone ? [encrypt(userData.phone)] : undefined;

      const newUser = await this.create({
        name: userData.username,
        email: userData.email,
        password: userData.password,
        ...(encryptedPhone && { phone: encryptedPhone }),
      });

      return newUser;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError("Sign up failed");
    }
  }

  async sendOtp(email: string): Promise<void> {
    try {
      const user = await this.getBy({ email });
      if (!user) throw new NotFoundError("User");
      await sendOtp(email);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to send OTP");
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    try {
      const raw = await redisService.get(`OTP:${email}`);
      if (!raw) throw new BadRequestError("OTP expired or not found");

      const payload = JSON.parse(raw) as { otp: string; attempts: number };

      if (payload.attempts >= 3) {
        await redisService.del(`OTP:${email}`);
        throw new BadRequestError("Too many OTP attempts. Please request a new one.");
      }

      if (payload.otp !== otp) {
        payload.attempts += 1;
        await redisService.set(`OTP:${email}`, JSON.stringify(payload), 600);
        throw new BadRequestError(`Invalid OTP. ${3 - payload.attempts} attempt(s) remaining.`);
      }

      await redisService.del(`OTP:${email}`);
      return true;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError("OTP verification failed");
    }
  }

  async googleAuth(googleAccessToken: string): Promise<IUserSignInReturn> {
    try {
      const { data } = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleAccessToken}`
      );

      if (!data.email) throw new BadRequestError("Invalid Google token");

      const { sub: googleId, email, name } = data;
      const resolvedName = name ?? email.split("@")[0];

      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (!user) {
        user = await User.create({
          name: resolvedName,
          email,
          googleId,
        } as any);
      } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      const { accessToken, refreshToken } = generateTokens({
        _id: user._id,
        username: user.name,
        email: user.email,
        password: "",
        DOB: new Date(),
      } as IUser);

      return {
        message: "Google sign in successful",
        accessToken,
        refreshToken,
        role: user.role,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError("Google authentication failed");
    }
  }
}

export const authService = new AuthService();
