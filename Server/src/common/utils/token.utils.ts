import jwt, { JwtPayload } from "jsonwebtoken";
import { BadRequestError, IUser } from "../";
import { env } from "../../config";

export const generateTokens = (
  payload: IUser,
): { accessToken: string; refreshToken: string } => {
  try {
    const sanitizedPayload = {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
    };
    const accessToken = jwt.sign(sanitizedPayload, env.access_sk, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(sanitizedPayload, env.refresh_sk, {
      expiresIn: "1w",
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new BadRequestError("Error Generating Token");
  }
};

export const verifyToken = (token: string): string | JwtPayload => {
  try {
    const verifyAccessToken = jwt.verify(token, env.access_sk);
    return verifyAccessToken;
  } catch (error) {
    try {
      const verifyRefreshToken = jwt.verify(token, env.refresh_sk);
      return verifyRefreshToken;
    } catch (error) {
      throw new BadRequestError("Invalid Token");
    }
  }
};
