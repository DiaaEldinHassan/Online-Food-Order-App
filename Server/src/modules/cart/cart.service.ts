import { Cart } from "../../db/models";
import { NotFoundError, BadRequestError } from "../../common";

interface CartItemInput {
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

class CartService {
  async getCart(customerId: string) {
    try {
      let cart = await Cart.findOne({ customer: customerId });
      if (!cart) {
        cart = await Cart.create({ customer: customerId, items: [], totalAmount: 0 });
      }
      return cart;
    } catch (error) {
      throw new BadRequestError("Failed to fetch cart");
    }
  }

  async addToCart(customerId: string, item: CartItemInput) {
    try {
      let cart = await Cart.findOne({ customer: customerId });
      if (!cart) {
        cart = await Cart.create({ customer: customerId, items: [], totalAmount: 0 });
      }

      const existingItemIndex = cart.items.findIndex(
        (i: any) => i.menuItemId.toString() === item.menuItemId
      );

      if (existingItemIndex > -1) {
        const existingItem = cart.items[existingItemIndex];
        if (existingItem) {
          existingItem.quantity += item.quantity;
        }
      } else {
        cart.items.push({
          menuItemId: item.menuItemId as any,
          restaurantId: item.restaurantId as any,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        } as any);
      }

      cart.totalAmount = (cart.items as any[]).reduce(
        (sum: number, i: any) => sum + i.price * i.quantity,
        0
      );

      await cart.save();
      return cart;
    } catch (error) {
      throw new BadRequestError("Failed to add item to cart");
    }
  }

  async updateCartItem(customerId: string, menuItemId: string, quantity: number) {
    try {
      const cart = await Cart.findOne({ customer: customerId });
      if (!cart) throw new NotFoundError("Cart");

      const item = (cart.items as any[]).find(
        (i: any) => i.menuItemId.toString() === menuItemId
      );
      if (!item) throw new NotFoundError("Cart item");

      item.quantity = quantity;
      cart.totalAmount = (cart.items as any[]).reduce(
        (sum: number, i: any) => sum + i.price * i.quantity,
        0
      );

      await cart.save();
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to update cart item");
    }
  }

  async removeFromCart(customerId: string, menuItemId: string) {
    try {
      const cart = await Cart.findOne({ customer: customerId });
      if (!cart) throw new NotFoundError("Cart");

      const items = cart.items as any[];
      const itemIndex = items.findIndex(
        (i: any) => i.menuItemId.toString() === menuItemId
      );
      if (itemIndex === -1) throw new NotFoundError("Cart item");

      items.splice(itemIndex, 1);
      cart.totalAmount = items.reduce(
        (sum: number, i: any) => sum + i.price * i.quantity,
        0
      );

      await cart.save();
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to remove item from cart");
    }
  }

  async clearCart(customerId: string) {
    try {
      const cart = await Cart.findOne({ customer: customerId });
      if (!cart) throw new NotFoundError("Cart");

      cart.items = [] as any;
      cart.totalAmount = 0;
      await cart.save();
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Failed to clear cart");
    }
  }
}

export const cartService = new CartService();
