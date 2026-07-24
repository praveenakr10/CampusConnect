import axiosClient from "./axiosClient";

export const improveQuestion = (title, body) =>
  axiosClient.post("/ai/improve-question", { title, body }).then((r) => r.data);

export const fetchAnswerSummary = (questionId) =>
  axiosClient.get(`/ai/questions/${questionId}/summary`).then((r) => r.data);
