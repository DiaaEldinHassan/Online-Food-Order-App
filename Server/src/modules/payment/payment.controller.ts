import { Router, Request, Response, NextFunction } from "express";
import { processPaymentSchema, paymentService } from "./";
import { validate } from "../../middleware/validation.middleware";
import { successReturn } from "../../common/utils/successReturn.utils";
import { authentication } from "../../middleware/auth.middleware";
import { ERole } from "../../common";

const router = Router();

router.use(authentication([ERole.customer]));

router.post(
  "/process",
  validate(processPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await paymentService.processPayment(req.user._id, req.body);
      successReturn(result, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/status/:orderId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await paymentService.getPaymentStatus(
        req.params.orderId as string,
        req.user._id
      );
      successReturn(status, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
