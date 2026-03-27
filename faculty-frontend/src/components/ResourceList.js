import { useEffect, useState } from "react";
import {
  getAllResources,
  deleteResource,
  updateResource,
  getAvailabilityByResource,
} from "../services/api";

import MyBookingsModal from "./MyBookingsModal";

function ResourceList({ reload, onBook, onAddAvailability }) {

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
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    { message: "✅ Booking confirmed", read: false },
    { message: "⚠️ Time slot updated", read: false },
  ]);

  // 🔍 FILTER STATES
  const [filters, setFilters] = useState({
    type: "",
    capacity: "",
    location: "",
    status: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // LOAD USER
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
  }, []);

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

  return (
    <div id="resource-list" style={{ padding: "20px" }}>

      {/* 🔥 HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2>📋 Resources</h2>

        <div style={{ display: "flex", gap: "10px" }}>

          {/* � FILTER BUTTON */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: "#17a2b8",
              color: "white",
              borderRadius: "5px",
              padding: "8px 12px",
              cursor: "pointer",
              border: "none",
              fontWeight: "600"
            }}
          >
            🔍 Filters {Object.values(filters).some(v => v) && "✓"}
          </button>

          {/* 🔔 NOTIFICATIONS */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              backgroundColor: "#ffc107",
              borderRadius: "5px",
              padding: "8px 12px"
            }}
          >
            🔔 ({notifications.filter(n => !n.read).length})
          </button>

          {/* 📅 MY BOOKINGS */}
          <button
            onClick={() => setShowMyBookings(true)}
            style={{
              backgroundColor: "#6f42c1",
              color: "white",
              padding: "8px 15px",
              borderRadius: "5px"
            }}
          >
            📅 Your Bookings
          </button>
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

      {/* � RESULTS COUNTER */}
      <div style={{
        marginBottom: "15px",
        fontSize: "14px",
        color: "#666",
        fontWeight: "500"
      }}>
        Showing <strong>{filteredResources.length}</strong> of <strong>{resources.length}</strong> resources
      </div>

      {/* �🔔 NOTIFICATION DROPDOWN */}
      {showNotifications && (
        <div style={{
          position: "absolute",
          right: "20px",
          top: "70px",
          background: "white",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
          width: "250px",
          zIndex: 1000
        }}>
          <b>Notifications</b>

          {/* ❌ CLEAR BUTTON */}
          <button
            onClick={() => setNotifications([])}
            style={{
              marginTop: "5px",
              marginBottom: "10px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Clear All
          </button>

          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} style={{
                padding: "5px",
                backgroundColor: n.read ? "#eee" : "#d1e7dd",
                marginTop: "5px",
                borderRadius: "3px"
              }}>
                {n.message}
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
            {editingId === r.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input name="name" value={editForm.name} onChange={handleChange} />

                <select name="type" value={editForm.type} onChange={handleChange}>
                  <option value="COMPUTER_LAB">Computer Lab</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>

                <input name="capacity" type="number" value={editForm.capacity} onChange={handleChange} />
                <input name="location" value={editForm.location} onChange={handleChange} />

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

                {/* AVAILABILITY */}
                <div>
                  <b>Availability:</b>
                  {availabilityMap[r.id]?.map((a, i) => (
                    <div key={i} style={{ fontSize: "12px" }}>
                      {a.date.split("T")[0]}: {a.startTime} - {a.endTime}
                    </div>
                  ))}
                </div>

                {/* ADMIN */}
                {user?.role === "ADMIN" && (
                  <>
                    <button onClick={() => handleEdit(r)}>Edit</button>
                    <button onClick={() => handleDelete(r.id)}>Delete</button>
                  </>
                )}

                {/* USER ACTIONS */}
                {r.status === "ACTIVE" && (
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
    </div>
  );
}

export default ResourceList;