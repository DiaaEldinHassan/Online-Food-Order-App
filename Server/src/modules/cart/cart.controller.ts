import { Router, Request, Response, NextFunction } from "express";
import { addToCartSchema, updateCartItemSchema, cartService } from "./";
import { validate } from "../../middleware/validation.middleware";
import { successReturn } from "../../common/utils/successReturn.utils";
import { authentication } from "../../middleware/auth.middleware";
import { ERole } from "../../common";

const router = Router();

router.use(authentication([ERole.customer]));

router.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await cartService.getCart(req.user._id);
      successReturn(cart, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/add",
  validate(addToCartSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await cartService.addToCart(req.user._id, req.body);
      successReturn(cart, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/update/:menuItemId",
  validate(updateCartItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await cartService.updateCartItem(
        req.user._id,
        req.params.menuItemId as string,
        req.body.quantity
      );
      successReturn(cart, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/remove/:menuItemId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await cartService.removeFromCart(
        req.user._id,
        req.params.menuItemId as string
      );
      successReturn(cart, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/clear",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cart = await cartService.clearCart(req.user._id);
      successReturn(cart, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
