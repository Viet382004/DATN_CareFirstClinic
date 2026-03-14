import axiosClient from "./axiosClient";

export const loginApi = async (data) => {
  const res = await axiosClient.post("/auth/login", data);

  // lưu token
  if (res.data?.data?.accessToken) {
    localStorage.setItem("accessToken", res.data.data.accessToken);
  }

  return res.data;
};

export const registerApi = async (data) => {
  const res = await axiosClient.post("/auth/register", data);
  return res.data;
};