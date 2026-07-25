import axiosClient from "./axiosClient";

export const fetchEvents = (params) =>
  axiosClient.get("/events", { params }).then((r) => r.data);

export const fetchEvent = (id) =>
  axiosClient.get(`/events/${id}`).then((r) => r.data);

export const createEvent = (data) => {
  const form = new FormData();
  form.append("title", data.title);
  form.append("eventDate", data.eventDate);
  form.append("venue", data.venue);
  form.append("clubName", data.clubName);
  if (data.additionalDetails) form.append("additionalDetails", data.additionalDetails);
  form.append("coordinators", JSON.stringify(data.coordinators || []));
  if (data.posterFile) form.append("poster", data.posterFile);

  return axiosClient
    .post("/events", form, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export const deleteEvent = (id, reason) =>
  axiosClient.delete(`/events/${id}`, { data: { reason } }).then((r) => r.data);
