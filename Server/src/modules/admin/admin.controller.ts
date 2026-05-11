import { Router, Request, Response, NextFunction } from "express";
import { updateOrderStatusSchema, adminService } from "./";
import { createRestaurantSchema, createMenuItemSchema, updateMenuItemSchema, updateRestaurantSchema } from "../menu";
import { validate } from "../../middleware/validation.middleware";
import { successReturn } from "../../common/utils/successReturn.utils";
import { authentication } from "../../middleware/auth.middleware";
import { ERole } from "../../common";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

router.use(authentication([ERole.admin]));

router.get(
  "/orders",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await adminService.getAllOrders();
      successReturn(orders, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/orders/:orderId/status",
  validate(updateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await adminService.updateOrderStatus(
        req.params.orderId as string,
        req.body.status
      );
      successReturn(order, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/restaurants",
  validate(createRestaurantSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurant = await adminService.createRestaurant(req.body);
      successReturn(restaurant, 201, res);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/restaurants/:restaurantId",
  validate(updateRestaurantSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurant = await adminService.updateRestaurant(
        req.params.restaurantId as string,
        req.body
      );
      successReturn(restaurant, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/restaurants/:restaurantId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.deleteRestaurant(
        req.params.restaurantId as string
      );
      successReturn(result, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/restaurants/:restaurantId/menu",
  validate(createMenuItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurant = await adminService.addMenuItem(
        req.params.restaurantId as string,
        req.body
      );
      successReturn(restaurant, 201, res);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/restaurants/:restaurantId/menu/:itemId",
  validate(updateMenuItemSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurant = await adminService.updateMenuItem(
        req.params.restaurantId as string,
        req.params.itemId as string,
        req.body
      );
      successReturn(restaurant, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/restaurants/:restaurantId/menu/:itemId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurant = await adminService.deleteMenuItem(
        req.params.restaurantId as string,
        req.params.itemId as string
      );
      successReturn(restaurant, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/menu-item/upload-url",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { originalName, contentType } = req.query as {
        originalName: string;
        contentType: string;
      };
      const result = await adminService.generateMenuItemUploadUrl(
        originalName,
        contentType
      );
      successReturn(result, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/menu-item/upload",
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }
      const result = await adminService.uploadMenuItemImage(req.file);
      successReturn(result, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
