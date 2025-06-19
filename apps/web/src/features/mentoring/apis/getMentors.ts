import axiosInstance from "./axionInstance";

export async function getMentors() {
  const response = await axiosInstance.get("/api/users");
  return response.data;
} 