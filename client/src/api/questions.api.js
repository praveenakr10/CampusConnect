import axiosClient from "./axiosClient";

export const fetchQuestions = (params) =>
  axiosClient.get("/questions", { params }).then((r) => r.data);

export const fetchQuestion = (id) =>
  axiosClient.get(`/questions/${id}`).then((r) => r.data);

export const createQuestion = (data) =>
  axiosClient.post("/questions", data).then((r) => r.data);

export const deleteQuestion = (id, reason) =>
  axiosClient.delete(`/questions/${id}`, { data: { reason } }).then((r) => r.data);
