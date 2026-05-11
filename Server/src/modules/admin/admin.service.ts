import { DBService } from "../../common";
import { Restaurant, Order } from "../../db/models";
import { NotFoundError, BadRequestError, generatePresignedUploadUrl, uploadToS3 } from "../../common";

class AdminService extends DBService<any> {
  constructor() {
    super(Restaurant);
  }

  async createRestaurant(data: any) {
    try {
      return await this.create(data);
    } catch (error) {
      throw new BadRequestError("Failed to create restaurant");
    }
  }

  async updateRestaurant(id: string, data: any) {
    try {
      const restaurant = await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      });
      if (!restaurant) throw new NotFoundError("Restaurant");
      return restaurant;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to update restaurant");
    }
  }

  async deleteRestaurant(id: string) {
    try {
      const restaurant = await this.model.findByIdAndDelete(id);
      if (!restaurant) throw new NotFoundError("Restaurant");
      return { message: "Restaurant deleted successfully" };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to delete restaurant");
    }
  }

  async addMenuItem(restaurantId: string, itemData: any) {
    try {
      const restaurant = await this.getById(restaurantId);
      restaurant.menu.push(itemData);
      await restaurant.save();
      return restaurant;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to add menu item");
    }
  }

  async updateMenuItem(restaurantId: string, itemId: string, itemData: any) {
    try {
      const restaurant = await this.getById(restaurantId);
      const item = restaurant.menu?.id(itemId);
      if (!item) throw new NotFoundError("Menu item");
      Object.assign(item, itemData);
      await restaurant.save();
      return restaurant;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to update menu item");
    }
  }

  async deleteMenuItem(restaurantId: string, itemId: string) {
    try {
      const restaurant = await this.getById(restaurantId);
      const item = restaurant.menu?.id(itemId);
      if (!item) throw new NotFoundError("Menu item");
      item.deleteOne();
      await restaurant.save();
      return restaurant;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to delete menu item");
    }
  }

  async getAllOrders() {
    try {
      const orders = await Order.find()
        .populate("customer", "name email")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      throw new BadRequestError("Failed to fetch orders");
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status, ...(status === "delivered" ? { paymentStatus: "paid" } : {}) },
        { new: true, runValidators: true }
      );
      if (!order) throw new NotFoundError("Order");
      return order;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to update order status");
    }
  }

  async generateMenuItemUploadUrl(originalName: string, contentType: string) {
    try {
      return await generatePresignedUploadUrl("menu", originalName, contentType);
    } catch (error) {
      throw new BadRequestError("Failed to generate upload URL");
    }
  }

  async uploadMenuItemImage(file: Express.Multer.File) {
    try {
      const url = await uploadToS3(file);
      return { url };
    } catch (error) {
      throw new BadRequestError("Failed to upload image");
    }
  }
}

export const adminService = new AdminService();
