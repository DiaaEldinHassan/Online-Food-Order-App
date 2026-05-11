import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String, 
  image: String,
  isAvailable: { type: Boolean, default: true }
});

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisineType: [String], 
  rating: { type: Number, default: 0 },
  location: {
    address: String,
    coordinates: [Number] 
  },
  menu: [MenuItemSchema],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Restaurant = mongoose.model('Restaurant', RestaurantSchema);