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

      {/* 🔔 NOTIFICATION DROPDOWN */}
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
        {resources.map((r) => (
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
        ))}
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