import api from "./axios";

export const getCart = () => api.get("/cart");
export const addToCart = (data) => api.post("/cart/add", data);
export const updateCartItem = (menuItemId, quantity) => api.patch(`/cart/update/${menuItemId}`, { quantity });
export const removeFromCart = (menuItemId) => api.delete(`/cart/remove/${menuItemId}`);
export const clearCart = () => api.delete("/cart/clear");
