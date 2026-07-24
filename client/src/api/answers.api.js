import axiosClient from "./axiosClient";

export const fetchAnswers = (questionId) =>
  axiosClient.get(`/answers/question/${questionId}`).then((r) => r.data);

export const createAnswer = (questionId, body) =>
  axiosClient.post(`/answers/question/${questionId}`, { body }).then((r) => r.data);

export const deleteAnswer = (id, reason) =>
  axiosClient.delete(`/answers/${id}`, { data: { reason } }).then((r) => r.data);

export const addComment = (answerId, body) =>
  axiosClient.post(`/answers/${answerId}/comments`, { body }).then((r) => r.data);
