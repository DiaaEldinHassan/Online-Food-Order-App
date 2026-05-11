import api from "./axios";

export const getRestaurants = () => api.get("/menu/restaurants");
export const getRestaurant = (id) => api.get(`/menu/restaurants/${id}`);
export const getMenuItems = (restaurantId) => api.get(`/menu/restaurants/${restaurantId}/menu`);
export const getMenuItem = (restaurantId, itemId) => api.get(`/menu/restaurants/${restaurantId}/menu/${itemId}`);
