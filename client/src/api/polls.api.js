import axiosClient from "./axiosClient";

export const fetchPolls = () => axiosClient.get("/polls").then((r) => r.data);
export const fetchPoll = (id) => axiosClient.get(`/polls/${id}`).then((r) => r.data);
export const createPoll = (data) => axiosClient.post("/polls", data).then((r) => r.data);
export const votePoll = (id, optionId) =>
  axiosClient.post(`/polls/${id}/vote`, { optionId }).then((r) => r.data);
export const deletePoll = (id) => axiosClient.delete(`/polls/${id}`).then((r) => r.data);
