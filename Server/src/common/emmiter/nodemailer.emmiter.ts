import { EventEmitter } from "events";
import nodemailer from "nodemailer";
import { env } from "../../";
import { redisService } from "../service";

export const emitter = new EventEmitter();

emitter.on("sendOtp", async ({ receiver, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: env.nodemailer_account, pass: env.nodemailer_password },
    });

    await transporter.sendMail({
      from: `"Sarahah App" <${env.nodemailer_account}>`,
      to: receiver,
      subject: "Your OTP Code",
      html,                  
    });

    emitter.emit("otpSent", { receiver });
    console.log(`[OTP] ✅ Email sent to ${receiver}`);

  } catch (error) {
    await redisService.del(`OTP:${receiver}`);
    emitter.emit("otpFailed", { receiver, error });
    console.error(`[OTP] ❌ Failed for ${receiver}:`, error);
  }
});

emitter.on("otpSent",   ({ receiver }) => console.log(`[OTP] Delivered to ${receiver}`));
emitter.on("otpFailed", ({ receiver, error }) => console.error(`[OTP] Failed for ${receiver}:`, error.message));

