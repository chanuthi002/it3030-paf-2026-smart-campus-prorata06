import { useEffect, useState } from "react";
import {
  getAllResources,
  deleteResource,
  updateResource,
  getAvailabilityByResource,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
  getIncidentsByReporter,
} from "../services/api";

import MyBookingsModal from "./MyBookingsModal";
import MyIncidentsModal from "./MyIncidentsModal";
import BookingHistoryModal from "./BookingHistoryModal";
import AdminBookingDashboard from "./AdminBookingDashboard";

function ResourceList({ reload, userRole, onBook, onAddAvailability }) {

  const [resources, setResources] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "ACTIVE",
  });

  const [user, setUser] = useState(null);

  // 🔥 NEW STATES
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showBookingHistory, setShowBookingHistory] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMyIncidents, setShowMyIncidents] = useState(false);
  const [myIncidents, setMyIncidents] = useState([]);

  const [notifications, setNotifications] = useState([]);

  // 🔍 FILTER STATES
  const [filters, setFilters] = useState({
    type: "",
    capacity: "",
    location: "",
    status: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // ⏰ AVAILABILITY EDIT STATES
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null);
  const [showEditAvailabilityModal, setShowEditAvailabilityModal] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [editAvailabilityForm, setEditAvailabilityForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  // LOAD USER
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
  }, []);

  // 🔔 LOAD NOTIFICATIONS FROM BACKEND
  const loadNotifications = () => {
    if (user?.id) {
      getUserNotifications(user.id)
        .then((res) => {
          setNotifications(res.data || []);
        })
        .catch((err) => {
          console.log("Error loading notifications:", err.message);
        });
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  // 🔔 HANDLE NOTIFICATION ACTIONS
  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId)
      .then(() => {
        loadNotifications();
      })
      .catch((err) => {
        console.log("Error marking as read:", err.message);
      });
  };

  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId)
      .then(() => {
        loadNotifications();
      })
      .catch((err) => {
        console.log("Error deleting notification:", err.message);
      });
  };

  const handleClearAllNotifications = () => {
    if (!window.confirm("Clear all notifications?")) return;

    clearAllNotifications(user?.id)
      .then(() => {
        setNotifications([]);
      })
      .catch((err) => {
        console.log("Error clearing notifications:", err.message);
      });
  };

  // 🚨 LOAD USER'S INCIDENTS
  const loadMyIncidents = () => {
    if (user?.id) {
      getIncidentsByReporter(user.id)
        .then((res) => {
          setMyIncidents(res.data || []);
        })
        .catch((err) => {
          console.log("Error loading incidents:", err.message);
        });
    }
  };

  // LOAD USER'S INCIDENTS WHEN MODAL OPENS
  useEffect(() => {
    if (showMyIncidents) {
      loadMyIncidents();
    }
  }, [showMyIncidents, user?.id]);

  // LOAD RESOURCES
  const loadData = () => {
    getAllResources().then((res) => {
      setResources(res.data);
    });
  };

  useEffect(() => {
    loadData();
  }, [reload]);

  // LOAD AVAILABILITY
  useEffect(() => {
    resources.forEach((r) => {
      getAvailabilityByResource(r.id)
        .then((res) => {
          setAvailabilityMap((prev) => ({
            ...prev,
            [r.id]: res.data,
          }));
        })
        .catch(() => {});
    });
  }, [resources]);

  // 🔍 HANDLE FILTER CHANGE
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // 🔍 APPLY FILTERS
  const getFilteredResources = () => {
    return resources.filter((r) => {
      if (filters.type && r.type !== filters.type) return false;
      if (filters.capacity && r.capacity < parseInt(filters.capacity)) return false;
      if (filters.location && !r.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.status && r.status !== filters.status) return false;
      return true;
    });
  };

  const filteredResources = getFilteredResources();

  // 🔍 GET UNIQUE VALUES FOR FILTERS
  const uniqueTypes = [...new Set(resources.map((r) => r.type))];
  const uniqueLocations = [...new Set(resources.map((r) => r.location))];
  const uniqueCapacities = [...new Set(resources.map((r) => r.capacity))].sort((a, b) => a - b);

  // DELETE
  const handleDelete = (id) => {
    deleteResource(id).then(() => {
      alert("Deleted!");
      loadData();
    });
  };

  // EDIT
  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setEditForm(resource);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // UPDATE
  const handleUpdate = () => {
    updateResource(editingId, editForm).then(() => {
      alert("Updated!");
      setEditingId(null);
      loadData();
    });
  };

  // ⏰ AVAILABILITY FUNCTIONS
  const handleEditAvailability = (availability) => {
    setEditingAvailability(availability);
    setEditingAvailabilityId(availability.id);
    setShowEditAvailabilityModal(true);
    setEditAvailabilityForm({
      date: availability.date.split("T")[0],
      startTime: availability.startTime,
      endTime: availability.endTime,
    });
  };

  const closeEditModal = () => {
    setShowEditAvailabilityModal(false);
    setEditingAvailability(null);
    setEditingAvailabilityId(null);
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setEditAvailabilityForm({ ...editAvailabilityForm, [name]: value });
  };

  const handleUpdateAvailability = () => {
    updateAvailability(editingAvailabilityId, editAvailabilityForm)
      .then(() => {
        alert("✅ Availability updated!");
        closeEditModal();
        loadData();
      })
      .catch((err) => {
        alert("❌ Error updating: " + (err.response?.data || err.message));
      });
  };

  const handleDeleteAvailability = (availabilityId) => {
    if (!window.confirm("Delete this availability slot?")) return;

    deleteAvailability(availabilityId)
      .then(() => {
        alert("✅ Availability deleted!");
        loadData();
      })
      .catch((err) => {
        alert("❌ Error deleting: " + (err.response?.data || err.message));
      });
  };

  // 🎨 BUTTON STYLES
  const buttonBaseStyle = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const filterButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  };

  const notificationButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    color: "white",
  };

  const bookingsButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "white",
  };

  const historyButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    color: "white",
  };

  const incidentsButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    color: "white",
  };

  return (
    <div id="resource-list" style={{ padding: "20px" }}>

      {/* 🔥 HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h2>📋 Resources</h2>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

          {/* 🔍 FILTER BUTTON */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={filterButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            🔍 Filters {Object.values(filters).some(v => v) && "✓"}
          </button>

          {/* 🔔 NOTIFICATIONS */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={notificationButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          >
            🔔 ({notifications.filter(n => !n.read).length})
          </button>

          {/* 📅 MY BOOKINGS - ONLY ADMIN & USER */}
          {(userRole === "ADMIN" || userRole === "USER") && (
            <button
              onClick={() => setShowMyBookings(true)}
              style={bookingsButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              📅 Your Bookings
            </button>
          )}

          {/* 📚 BOOKING HISTORY - ONLY ADMIN & USER */}
          {(userRole === "ADMIN" || userRole === "USER") && (
            <button
              onClick={() => setShowBookingHistory(true)}
              style={historyButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              📚 Booking History
            </button>
          )}

          {/* 🚨 MY INCIDENTS - ADMIN, STAFF, USER */}
          {(userRole === "ADMIN" || userRole === "STAFF" || userRole === "USER") && (
            <button
              onClick={() => setShowMyIncidents(true)}
              style={incidentsButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              🚨 My Incidents ({myIncidents.length})
            </button>
          )}
        </div>
      </div>

      {/* 🔍 FILTER PANEL */}
      {showFilters && (
        <div style={{
          backgroundColor: "#f9f9f9",
          border: "2px solid #17a2b8",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          alignItems: "flex-end"
        }}>
          {/* TYPE FILTER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontWeight: "600", fontSize: "13px" }}>Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              style={{
                padding: "8px 10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "13px",
                minWidth: "150px"
              }}
            >
              <option value="">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* CAPACITY FILTER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontWeight: "600", fontSize: "13px" }}>Min Capacity</label>
            <input
              type="number"
              name="capacity"
              placeholder="Min capacity"
              value={filters.capacity}
              onChange={handleFilterChange}
              style={{
                padding: "8px 10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "13px",
                minWidth: "120px"
              }}
            />
          </div>

          {/* LOCATION FILTER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontWeight: "600", fontSize: "13px" }}>Location</label>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              style={{
                padding: "8px 10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "13px",
                minWidth: "150px"
              }}
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS FILTER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontWeight: "600", fontSize: "13px" }}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={{
                padding: "8px 10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                fontSize: "13px",
                minWidth: "150px"
              }}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>

          {/* RESET FILTERS */}
          {Object.values(filters).some(v => v) && (
            <button
              onClick={() => setFilters({ type: "", capacity: "", location: "", status: "" })}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              🔄 Reset Filters
            </button>
          )}
        </div>
      )}

      {/* 📊 RESULTS COUNTER */}
      <div style={{
        marginBottom: "15px",
        fontSize: "14px",
        color: "#666",
        fontWeight: "500"
      }}>
        Showing <strong>{filteredResources.length}</strong> of <strong>{resources.length}</strong> resources
      </div>

      {/* 🔔 NOTIFICATION DROPDOWN */}
      {showNotifications && (
        <div style={{
          position: "fixed",
          right: "20px",
          top: "70px",
          background: "white",
          border: "2px solid #ffc107",
          borderRadius: "8px",
          width: "350px",
          maxHeight: "500px",
          overflowY: "auto",
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
        }}>
          <div style={{
            padding: "12px 15px",
            borderBottom: "1px solid #eee",
            backgroundColor: "#fff8e1",
            fontWeight: "600",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: "0"
          }}>
            <span>🔔 Notifications ({notifications.length})</span>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAllNotifications}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "600"
                }}
              >
                ✕ Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ color: "#999", padding: "10px" }}>📭 No notifications</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={{
                padding: "10px",
                backgroundColor: n.read ? "#fafafa" : "#fffbf0",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "8px"
              }}>
                <div style={{ flex: 1, fontSize: "12px" }}>
                  <p style={{
                    margin: "0 0 4px 0",
                    fontWeight: n.read ? "400" : "600",
                    color: n.read ? "#666" : "#000"
                  }}>
                    {n.message}
                  </p>
                  <p style={{
                    margin: "0",
                    fontSize: "10px",
                    color: "#999"
                  }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as read"
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        padding: "3px 5px",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "10px"
                      }}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(n.id)}
                    title="Delete"
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "3px 5px",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "10px"
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 📦 RESOURCE CARDS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredResources.length === 0 ? (
          <div style={{ width: "100%", textAlign: "center", padding: "40px", color: "#999" }}>
            <p style={{ fontSize: "18px" }}>📭 No resources found matching your filters</p>
            {Object.values(filters).some(v => v) && (
              <p style={{ fontSize: "14px" }}>Try adjusting your filter criteria</p>
            )}
          </div>
        ) : (
          filteredResources.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "260px",
              backgroundColor:
                r.status === "OUT_OF_SERVICE" ? "#eee" : "#f9f9f9",
              opacity: r.status === "OUT_OF_SERVICE" ? 0.7 : 1,
            }}
          >
            {(editingId === r.id && user?.role === "ADMIN") ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input name="name" value={editForm.name} onChange={handleChange} />

                <select name="type" value={editForm.type} onChange={handleChange}>
                  <option value="COMPUTER_LAB">Computer Lab</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>

                <input name="capacity" type="number" value={editForm.capacity} onChange={handleChange} />
                <select 
  name="location" 
  value={editForm.location} 
  onChange={handleChange}
>
  <option value="">Select Building</option>
  <option value="Building A">Building A</option>
  <option value="Building B">Building B</option>
  <option value="Building C">Building C</option>
  <option value="Building D">Building D</option>
  <option value="Building E">Building E</option>
  <option value="Building F">Building F</option>
</select>

                <select name="status" value={editForm.status} onChange={handleChange}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </select>

                <div>
                  <button onClick={handleUpdate}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{r.name}</h3>
                <p><b>Type:</b> {r.type}</p>
                <p><b>Capacity:</b> {r.capacity}</p>
                <p><b>Location:</b> {r.location}</p>

                <p>
                  <b>Status:</b>{" "}
                  <span style={{ color: r.status === "ACTIVE" ? "green" : "red" }}>
                    {r.status}
                  </span>
                </p>

                {/* ⏰ AVAILABILITY - SHOW FOR ADMIN & USER */}
                {(userRole === "ADMIN" || userRole === "USER") && (
                  <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
                    <b style={{ display: "block", marginBottom: "8px" }}>⏰ Availability Slots:</b>
                    
                    {availabilityMap[r.id]?.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "#999", margin: "5px 0" }}>No availability added</p>
                    ) : (
                      availabilityMap[r.id]?.map((a, i) => (
                        <div key={a.id} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                          padding: "6px",
                          backgroundColor: "white",
                          marginBottom: "5px",
                          borderRadius: "4px",
                          border: "1px solid #eee"
                        }}>
                          <span>
                            {a.date.split("T")[0]}: {a.startTime} - {a.endTime}
                          </span>
                          {user?.role === "ADMIN" && (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => handleEditAvailability(a)}
                                style={{
                                  padding: "2px 6px",
                                  backgroundColor: "#007bff",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "3px",
                                  cursor: "pointer",
                                  fontSize: "10px"
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAvailability(a.id)}
                                style={{
                                  padding: "2px 6px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "3px",
                                  cursor: "pointer",
                                  fontSize: "10px"
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ADMIN BUTTONS */}
                {user?.role === "ADMIN" && (
                  <>
                    <button onClick={() => handleEdit(r)}>Edit</button>
                    <button onClick={() => handleDelete(r.id)}>Delete</button>
                  </>
                )}

                {/* USER & ADMIN BOOKING ACTIONS */}
                {r.status === "ACTIVE" && (userRole === "ADMIN" || userRole === "USER") && (
                  <>
                    <button onClick={() => onBook(r)}>Book</button>

                    {user?.role === "ADMIN" && (
                      <button onClick={() => onAddAvailability(r)}>
                        Add Availability
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ))
        )}
      </div>

      {/* 📅 MY BOOKINGS MODAL */}
      {showMyBookings && (
        <MyBookingsModal
          resources={resources}
          onClose={() => setShowMyBookings(false)}
        />
      )}

      {/* 📚 BOOKING HISTORY MODAL */}
      {showBookingHistory && (
        <BookingHistoryModal
          resources={resources}
          onClose={() => setShowBookingHistory(false)}
        />
      )}
      {/* 📊 ADMIN BOOKING DASHBOARD MODAL */}
      {showAdminDashboard && (
        <AdminBookingDashboard
          onClose={() => setShowAdminDashboard(false)}
        />
      )}
      {/* 🚨 MY INCIDENTS MODAL */}
      {showMyIncidents && (
        <MyIncidentsModal
          myIncidents={myIncidents}
          onClose={() => setShowMyIncidents(false)}
          onResolved={() => {
            setShowMyIncidents(false);
            loadMyIncidents();
          }}
        />
      )}

      {/* ⏰ EDIT AVAILABILITY MODAL */}
      {showEditAvailabilityModal && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "30px",
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
          }}>
            <h3 style={{ marginBottom: "20px" }}>✏️ Edit Availability Slot</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* DATE */}
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={editAvailabilityForm.date}
                  onChange={handleAvailabilityChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* START TIME */}
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={editAvailabilityForm.startTime}
                  onChange={handleAvailabilityChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* END TIME */}
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={editAvailabilityForm.endTime}
                  onChange={handleAvailabilityChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* BUTTONS */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={handleUpdateAvailability}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  ✅ Save Changes
                </button>
                <button
                  onClick={closeEditModal}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px"
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceList;