import { Order } from "../../db/models";
import { NotFoundError, BadRequestError } from "../../common";

class OrderService {
  async placeOrder(customerId: string, orderData: any) {
    try {
      const order = await Order.create({
        customer: customerId,
        restaurant: orderData.restaurantId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: "placed",
        paymentStatus: "pending",
        deliveryAddress: orderData.deliveryAddress
      });
      return order;
    } catch (error) {
      throw new BadRequestError("Failed to place order");
    }
  }

  async getOrders(customerId: string) {
    try {
      const orders = await Order.find({ customer: customerId })
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      throw new BadRequestError("Failed to fetch orders");
    }
  }

  async getOrderById(orderId: string, customerId: string) {
    try {
      const order = await Order.findOne({ _id: orderId, customer: customerId })
        .populate("restaurant", "name");
      if (!order) throw new NotFoundError("Order");
      return order;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to fetch order");
    }
  }

  async cancelOrder(orderId: string, customerId: string) {
    try {
      const order = await Order.findOne({ _id: orderId, customer: customerId });
      if (!order) throw new NotFoundError("Order");
      if (order.status === "delivered" || order.status === "cancelled") {
        throw new BadRequestError("Cannot cancel this order");
      }
      order.status = "cancelled" as any;
      await order.save();
      return order;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new BadRequestError("Failed to cancel order");
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
      const order = await Order.findById(orderId);
      if (!order) throw new NotFoundError("Order");
      const validStatuses = ["placed", "preparing", "out-for-delivery", "delivered", "cancelled"] as const;
      if (!(validStatuses as readonly string[]).includes(status)) {
        throw new BadRequestError("Invalid order status");
      }
      order.status = status as any;
      if (status === "delivered") {
        order.paymentStatus = "paid" as any;
      }
      await order.save();
      return order;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new BadRequestError("Failed to update order status");
    }
  }
}

export const orderService = new OrderService();
