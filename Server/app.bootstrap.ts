import express from "express"
import cors from "cors";
import { env, globalErrorHandler, dbConnect, i18n, redisConnect, ensureBucketPublicRead} from "./src";
import { authLimiter, otpLimiter, apiLimiter, publicLimiter, adminLimiter } from "./src/middleware/rateLimit.middleware";
import {default as auth} from "./src/modules/auth/auth.controller";
import {default as menu} from "./src/modules/menu/menu.controller";
import {default as cart} from "./src/modules/cart/cart.controller";
import {default as order} from "./src/modules/order/order.controller";
import {default as payment} from "./src/modules/payment/payment.controller";
import {default as admin} from "./src/modules/admin/admin.controller";
import {default as profile} from "./src/modules/profile/profile.controller";



export const bootstrap=async ()=>{
    const app=express();
    // CORS
    app.use(cors({ origin: "http://localhost:5173", credentials: true }));
    // File Parser
    app.use(express.json());
    // i18n Middleware
    app.use(i18n);
    // DB Connection
    await dbConnect();
    await redisConnect();
    // Make S3 bucket objects publicly readable
    await ensureBucketPublicRead();
    
    // Routes
     app.use("/auth/sendOtp", otpLimiter);
     app.use("/auth/verifyOtp", otpLimiter);
     app.use("/auth", authLimiter, auth);
     app.use("/menu", publicLimiter, menu);
     app.use("/cart", apiLimiter, cart);
     app.use("/order", apiLimiter, order);
     app.use("/payment", apiLimiter, payment);
     app.use("/admin", adminLimiter, admin);
     app.use("/profile", apiLimiter, profile);

    // Error Middleware
    app.use(globalErrorHandler);
    // App Listen
    app.listen(env.port,()=>{
        console.log(`App is Running On Port ${env.port} 🚀🚀🚀`);
    })
}