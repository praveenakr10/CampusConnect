import axiosClient from "./axiosClient";

export const fetchUserProfile = (id) =>
  axiosClient.get(`/users/${id}`).then((r) => r.data);
