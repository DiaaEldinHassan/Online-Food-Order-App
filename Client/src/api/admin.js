import api from "./axios";

export const getAllOrders = () => api.get("/admin/orders");
export const updateOrderStatus = (orderId, status) => api.patch(`/admin/orders/${orderId}/status`, { status });

export const createRestaurant = (data) => api.post("/admin/restaurants", data);
export const updateRestaurant = (id, data) => api.patch(`/admin/restaurants/${id}`, data);
export const deleteRestaurant = (id) => api.delete(`/admin/restaurants/${id}`);

export const addMenuItem = (restaurantId, data) => api.post(`/admin/restaurants/${restaurantId}/menu`, data);
export const updateMenuItem = (restaurantId, itemId, data) => api.patch(`/admin/restaurants/${restaurantId}/menu/${itemId}`, data);
export const deleteMenuItem = (restaurantId, itemId) => api.delete(`/admin/restaurants/${restaurantId}/menu/${itemId}`);

export const uploadMenuItemImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/admin/menu-item/upload", formData);
  return data;
};
