import api from "./axios";

export const placeOrder = (data) => api.post("/order", data);
export const getOrders = () => api.get("/order");
export const getOrderById = (orderId) => api.get(`/order/${orderId}`);
export const cancelOrder = (orderId) => api.patch(`/order/${orderId}/cancel`);
