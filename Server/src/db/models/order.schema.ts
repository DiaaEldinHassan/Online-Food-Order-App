import mongoose from "mongoose";
import { AddressSchema } from "./user.model";
const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    menuItemId: mongoose.Schema.Types.ObjectId,
    name: String,
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['placed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'placed' 
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  deliveryAddress: AddressSchema 
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);