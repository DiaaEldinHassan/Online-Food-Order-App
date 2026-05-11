import api from "./axios";

export const getProfile = () => api.get("/profile");
export const updateProfile = (data) => api.patch("/profile", data);

export const uploadProfilePic = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await api.post("/profile/profile-pic/upload", formData);
  return data;
};
