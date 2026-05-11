import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { signInSchema, authService, signUpSchema, sendOtpSchema, verifyOtpSchema, googleAuthSchema } from "./";
import { validate } from "../../middleware/validation.middleware";
import { successReturn } from "../../common/utils/successReturn.utils";
import { ValidationError } from "../../common/utils/errors.utils";
import { authentication } from "../../middleware/auth.middleware";
import { ERole } from "../../common";

const router = Router();

router.post(
  "/signIn",
  validate(signInSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.signIn(req.body);
      successReturn(result, result.statusCode, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(new ValidationError("Validation failed", error.issues));
      }
      next(error);
    }
  },
);

router.post(
  "/signUp",
  validate(signUpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.signUp(req.body);
      successReturn(user, 201, res);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/signOut",
  authentication([ERole.customer, ERole.admin, ERole.driver]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization!.split(" ")[1]!;
      await authService.signOut(token);
      successReturn({ message: "Signed out successfully" }, 200, res);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/sendOtp",
  validate(sendOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.sendOtp(req.body.email);
      successReturn({ message: "OTP sent successfully" }, 200, res);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/verifyOtp",
  validate(verifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.verifyOtp(req.body.email, req.body.otp);
      successReturn({ message: "OTP verified successfully" }, 200, res);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/google",
  validate(googleAuthSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.googleAuth(req.body.accessToken);
      successReturn(result, result.statusCode, res);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
