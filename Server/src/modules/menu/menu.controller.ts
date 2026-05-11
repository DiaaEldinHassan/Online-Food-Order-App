import { Router, Request, Response, NextFunction } from "express";
import { menuService } from "./";
import { successReturn } from "../../common/utils/successReturn.utils";

const router = Router();

router.get(
  "/restaurants",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurants = await menuService.getAllRestaurants();
      successReturn(restaurants, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/restaurants/:restaurantId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurant = await menuService.getRestaurantById(
        req.params.restaurantId as string
      );
      successReturn(restaurant, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/restaurants/:restaurantId/menu",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const menu = await menuService.getMenuItems(req.params.restaurantId as string);
      successReturn(menu, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/restaurants/:restaurantId/menu/:itemId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await menuService.getMenuItem(
        req.params.restaurantId as string,
        req.params.itemId as string
      );
      successReturn(item, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
