import { Router, Request, Response, NextFunction } from "express";
import { placeOrderSchema, orderService } from "./";
import { validate } from "../../middleware/validation.middleware";
import { successReturn } from "../../common/utils/successReturn.utils";
import { authentication } from "../../middleware/auth.middleware";
import { ERole } from "../../common";

const router = Router();

router.use(authentication([ERole.customer]));

router.post(
  "/",
  validate(placeOrderSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.placeOrder(req.user._id, req.body);
      successReturn(order, 201, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await orderService.getOrders(req.user._id);
      successReturn(orders, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:orderId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.getOrderById(
        req.params.orderId as string,
        req.user._id
      );
      successReturn(order, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:orderId/cancel",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.cancelOrder(
        req.params.orderId as string,
        req.user._id
      );
      successReturn(order, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
