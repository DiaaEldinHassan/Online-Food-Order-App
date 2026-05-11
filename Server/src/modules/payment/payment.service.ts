import { Order } from "../../db/models";
import { NotFoundError, BadRequestError } from "../../common";

class PaymentService {
  async processPayment(customerId: string, paymentData: { orderId: string; method: string }) {
    try {
      const order = await Order.findOne({ _id: paymentData.orderId, customer: customerId });
      if (!order) throw new NotFoundError("Order");
      if (order.paymentStatus === "paid") {
        throw new BadRequestError("Order already paid");
      }

      if (paymentData.method === "cod") {
        order.paymentStatus = "pending";
        await order.save();
        return { message: "Cash on Delivery selected", order, paymentMethod: "cod" };
      }

      if (paymentData.method === "online") {
        order.paymentStatus = "paid";
        await order.save();
        return { message: "Payment successful", order, paymentMethod: "online" };
      }

      throw new BadRequestError("Invalid payment method");
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) throw error;
      throw new BadRequestError("Payment processing failed");
    }
  }

  async getPaymentStatus(orderId: string, customerId: string) {
    try {
      const order = await Order.findOne({ _id: orderId, customer: customerId });
      if (!order) throw new NotFoundError("Order");
      return {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to get payment status");
    }
  }
}

export const paymentService = new PaymentService();
