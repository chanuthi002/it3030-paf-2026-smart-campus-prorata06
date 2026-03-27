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

export const updateAvailability = (id, data) =>
  API.put(`/availability/${id}`, data);

export const deleteAvailability = (id) =>
  API.delete(`/availability/${id}`);

// ✅ GET BY USER (NEW)
export const getBookingsByUser = (userId) =>
  API.get(`/bookings/user/${userId}`);

// =======================
// 🔹 INCIDENT TICKET APIs
// =======================

// ✅ CREATE INCIDENT
export const createIncident = (data) =>
  API.post("/incidents", data);

// ✅ GET ALL INCIDENTS
export const getAllIncidents = () =>
  API.get("/incidents");

// ✅ GET BY ID
export const getIncidentById = (ticketId) =>
  API.get(`/incidents/${ticketId}`);

// ✅ GET BY STATUS
export const getIncidentsByStatus = (status) =>
  API.get(`/incidents/status/${status}`);

// ✅ GET BY RESOURCE
export const getIncidentsByResource = (resourceId) =>
  API.get(`/incidents/resource/${resourceId}`);

// ✅ GET BY REPORTER
export const getIncidentsByReporter = (reportedByUserId) =>
  API.get(`/incidents/reporter/${reportedByUserId}`);

// ✅ GET BY TECHNICIAN
export const getIncidentsByTechnician = (assignedToUserId) =>
  API.get(`/incidents/technician/${assignedToUserId}`);

// ✅ GET BY PRIORITY
export const getIncidentsByPriority = (priority) =>
  API.get(`/incidents/priority/${priority}`);

// ✅ ASSIGN INCIDENT
export const assignIncident = (ticketId, technicianUserId, technicianName) =>
  API.put(`/incidents/${ticketId}/assign`, null, {
    params: { technicianUserId, technicianName },
  });

// ✅ UPDATE STATUS
export const updateIncidentStatus = (ticketId, newStatus) =>
  API.put(`/incidents/${ticketId}/status`, null, {
    params: { newStatus },
  });

// ✅ UPDATE PRIORITY
export const updateIncidentPriority = (ticketId, newPriority) =>
  API.put(`/incidents/${ticketId}/priority`, null, {
    params: { newPriority },
  });

// ✅ RESOLVE INCIDENT
export const resolveIncident = (ticketId, resolution) =>
  API.put(`/incidents/${ticketId}/resolve`, null, {
    params: { resolution },
  });

// ✅ DELETE INCIDENT
export const deleteIncident = (ticketId) =>
  API.delete(`/incidents/${ticketId}`);

// =======================
// 🔹 TECHNICIAN UPDATE APIs
// =======================

// ✅ GET TICKET UPDATES (TIMELINE)
export const getIncidentUpdates = (ticketId) =>
  API.get(`/technician-updates/ticket/${ticketId}`);

// ✅ ADD COMMENT
export const addIncidentComment = (data) =>
  API.post("/technician-updates/comment", data);

// ✅ LOG STATUS CHANGE
export const logStatusChange = (data) =>
  API.post("/technician-updates/status-change", data);

// ✅ LOG WORK
export const logWorkTime = (data) =>
  API.post("/technician-updates/work-log", data);

// ✅ ADD NOTE
export const addIncidentNote = (data) =>
  API.post("/technician-updates/note", data);

// =======================
// 🔹 ATTACHMENT APIs
// =======================

// ✅ GET ATTACHMENTS BY TICKET
export const getAttachmentsByTicket = (ticketId) =>
  API.get(`/attachments/ticket/${ticketId}`);

// ✅ GET ATTACHMENT BY ID
export const getAttachmentById = (attachmentId) =>
  API.get(`/attachments/${attachmentId}`);

// ✅ DELETE ATTACHMENT
export const deleteAttachment = (attachmentId) =>
  API.delete(`/attachments/${attachmentId}`);

// =======================
// 🔹 NOTIFICATION APIs
// =======================

// ✅ GET USER NOTIFICATIONS
export const getUserNotifications = (userId) =>
  API.get(`/notifications/${userId}`);

// ✅ GET UNREAD COUNT
export const getUnreadNotificationCount = (userId) =>
  API.get(`/notifications/${userId}/unread-count`);

// ✅ MARK AS READ
export const markNotificationAsRead = (notificationId) =>
  API.put(`/notifications/${notificationId}/mark-as-read`);

// ✅ DELETE NOTIFICATION
export const deleteNotification = (notificationId) =>
  API.delete(`/notifications/${notificationId}`);

// ✅ CLEAR ALL NOTIFICATIONS
export const clearAllNotifications = (userId) =>
  API.delete(`/notifications/${userId}/clear-all`);