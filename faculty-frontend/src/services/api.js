import axios from "axios";

// ✅ AXIOS INSTANCE
const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// =======================
// 🔹 RESOURCE APIs
// =======================

export const getAllResources = () => API.get("/resources");

export const createResource = (data) => API.post("/resources", data);

export const deleteResource = (id) => API.delete(`/resources/${id}`);

export const updateResource = (id, data) =>
  API.put(`/resources/${id}`, data);

export const searchResources = (type, location) =>
  API.get(`/resources/search?type=${type}&location=${location}`);

// =======================
// 🔹 BOOKING APIs (UPDATED)
// =======================

// ✅ CREATE
export const createBooking = (data) =>
  API.post("/bookings", data);

// ✅ GET BY RESOURCE
export const getBookingsByResource = (resourceId) =>
  API.get(`/bookings/resource/${resourceId}`);

// ✅ GET BY DATE
export const getBookingsByDate = (date) =>
  API.get(`/bookings/date/${date}`);

// =======================
// 🔹 AVAILABILITY APIs
// =======================

export const getAvailabilityByResource = (resourceId) =>
  API.get(`/availability/${resourceId}`);

export const createAvailability = (data) =>
  API.post("/availability", data);

// ✅ GET BY USER (NEW)
export const getBookingsByUser = (userId) =>
  API.get(`/bookings/user/${userId}`);