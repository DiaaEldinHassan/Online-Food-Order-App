import api from "./axios";

export const signIn = (data) => api.post("/auth/signIn", data);
export const signUp = (data) => api.post("/auth/signUp", data);
export const signOut = () => api.post("/auth/signOut");
export const sendOtp = (email) => api.post("/auth/sendOtp", { email });
export const verifyOtp = (email, otp) => api.post("/auth/verifyOtp", { email, otp });
export const googleAuth = (accessToken) => api.post("/auth/google", { accessToken });
