import axiosClient from "./axiosClient";

export const toggleVote = (targetType, targetId) =>
  axiosClient.post("/votes", { targetType, targetId }).then((r) => r.data);
