import axiosClient from "./axiosClient";

export const fetchAuditLogs = () => axiosClient.get("/admin/audit-logs").then((r) => r.data);
export const fetchUsers = () => axiosClient.get("/admin/users").then((r) => r.data);
export const banUser = (userId, reason) =>
  axiosClient.post(`/admin/users/${userId}/ban`, { reason }).then((r) => r.data);
export const unbanUser = (userId) =>
  axiosClient.post(`/admin/users/${userId}/unban`).then((r) => r.data);
export const setUserRole = (userId, role) =>
  axiosClient.post(`/admin/users/${userId}/role`, { role }).then((r) => r.data);
