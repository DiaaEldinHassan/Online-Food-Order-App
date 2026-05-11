import api from "./axios";

export const processPayment = (data) => api.post("/payment/process", data);
export const getPaymentStatus = (orderId) => api.get(`/payment/status/${orderId}`);
