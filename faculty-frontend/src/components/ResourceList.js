import { useEffect, useState, useMemo } from "react";
import {
  getAllResources,
  deleteResource,
  updateResource,
  getAvailabilityByResource,
  createAvailability,
  updateAvailability,
  deleteAvailability,
} from "../services/api";

function ResourceList({ reload }) {
  const [resources, setResources] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [user, setUser] = useState(null);

  // Filter States
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "All Types",
    minCapacity: "",
    location: "All Locations",
    status: "All Status"
  });

  // Modal States
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [showEditAvailabilityModal, setShowEditAvailabilityModal] = useState(false);
  const [showAddAvailabilityModal, setShowAddAvailabilityModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showYourBookingsModal, setShowYourBookingsModal] = useState(false);
  const [showBookingHistoryModal, setShowBookingHistoryModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);

  // Form States
  const [editForm, setEditForm] = useState({ name: "", location: "", capacity: "", status: "" });
  const [availabilityForm, setAvailabilityForm] = useState({ startTime: "", endTime: "" });
  const [bookingForm, setBookingForm] = useState({ date: "", startTime: "", endTime: "" });

  // Dummy Bookings
  const [yourBookings] = useState([
    {
      id: "69c5f3ed4d8c006295553202",
      resourceName: "Projector",
      date: "2026-03-30",
      startTime: "08:38:00",
      endTime: "00:38:00",
      bookedBy: "chanuthi wakista"
    }
  ]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (filters.type !== "All Types" && r.type !== filters.type) return false;
      if (filters.minCapacity && Number(r.capacity) < Number(filters.minCapacity)) return false;
      if (filters.location !== "All Locations" && r.location !== filters.location) return false;
      if (filters.status !== "All Status" && r.status !== filters.status) return false;
      return true;
    });
  }, [resources, filters]);

  // Styles
  const buttonBase = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.25s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const buttonStyles = {
    primary: { ...buttonBase, background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff" },
    success: { ...buttonBase, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff" },
    danger: { ...buttonBase, background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff" },
    warning: { ...buttonBase, background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" },
    small: { padding: "6px 10px", fontSize: "11px" },
  };

  const navButtonStyle = {
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const modalOverlay = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000
  };

  const modalContent = {
    background: "#fff", padding: "24px", borderRadius: "12px",
    width: "460px", maxWidth: "92%", boxShadow: "0 15px 35px rgba(0,0,0,0.25)"
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    setUser(stored);
  }, []);

  const loadData = () => {
    getAllResources().then((res) => setResources(res.data));
  };

  useEffect(() => { loadData(); }, [reload]);

  useEffect(() => {
    resources.forEach((r) => {
      getAvailabilityByResource(r.id).then((res) => {
        setAvailabilityMap((prev) => ({ ...prev, [r.id]: res.data }));
      });
    });
  }, [resources]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => setShowFilterModal(false);
  const resetFilters = () => {
    setFilters({ type: "All Types", minCapacity: "", location: "All Locations", status: "All Status" });
    setShowFilterModal(false);
  };

  const openEditResource = (r) => {
    setSelectedResource(r);
    setEditForm({ name: r.name || "", location: r.location || "", capacity: r.capacity || "", status: r.status || "ACTIVE" });
    setShowEditResourceModal(true);
  };

  const handleUpdateResource = () => {
    updateResource(selectedResource.id, editForm).then(() => {
      alert("Resource updated successfully!");
      setShowEditResourceModal(false);
      loadData();
    });
  };

  const openEditAvailability = (a) => {
    setSelectedAvailability(a);
    setAvailabilityForm({ startTime: a.startTime, endTime: a.endTime });
    setShowEditAvailabilityModal(true);
  };

  const handleUpdateAvailability = () => {
    updateAvailability(selectedAvailability.id, availabilityForm).then(() => {
      alert("Availability slot updated!");
      setShowEditAvailabilityModal(false);
      loadData();
    });
  };

  const openAddAvailability = (r) => {
    setSelectedResource(r);
    setAvailabilityForm({ startTime: "", endTime: "" });
    setShowAddAvailabilityModal(true);
  };

  const handleAddAvailability = () => {
    createAvailability(selectedResource.id, availabilityForm).then(() => {
      alert("Availability added successfully!");
      setShowAddAvailabilityModal(false);
      loadData();
    });
  };

  const openBookingModal = (r) => {
    setSelectedResource(r);
    setBookingForm({ date: "", startTime: "", endTime: "" });
    setShowBookingModal(true);
  };

  const handleBook = () => {
    alert(`Booking confirmed for ${selectedResource?.name}`);
    setShowBookingModal(false);
  };

  const handleDeleteResource = (id) => {
    if (window.confirm("Delete this resource?")) {
      deleteResource(id).then(() => { alert("Deleted!"); loadData(); });
    }
  };

  const handleDeleteAvailability = (id) => {
    if (window.confirm("Delete this slot?")) {
      deleteAvailability(id).then(() => { alert("Slot deleted"); loadData(); });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", paddingBottom: "16px", borderBottom: "1px solid #e5e7eb" }}>
        <h2 style={{ margin: 0 }}>Resources</h2>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button style={navButtonStyle} onClick={() => setShowFilterModal(true)}>🔍 Filters</button>
          <button style={{ ...navButtonStyle, position: "relative" }} onClick={() => setShowNotificationsModal(true)}>
            🔔 Notifications <span style={{position:"absolute", top:"-2px", right:"-2px", background:"#ef4444", color:"#fff", fontSize:"10px", padding:"1px 5px", borderRadius:"50%"}}>0</span>
          </button>
          <button style={navButtonStyle} onClick={() => setShowYourBookingsModal(true)}>📅 Your Bookings</button>
          <button style={navButtonStyle} onClick={() => setShowBookingHistoryModal(true)}>📚 Booking History</button>
          <button style={navButtonStyle} onClick={() => setShowIncidentModal(true)}>🚨 My Incidents (0)</button>
        </div>
      </div>

      {/* Resource Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "22px" }}>
        {filteredResources.length > 0 ? (
          filteredResources.map((r) => (
            <div
              key={r.id}
              style={{
                width: "280px", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb",
                background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.07)", transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <h3>{r.name}</h3>
              <p><b>Type:</b> {r.type}</p>
              <p><b>Capacity:</b> {r.capacity}</p>
              <p><b>Location:</b> {r.location}</p>
              <p><b>Status:</b> <span style={{ color: r.status === "ACTIVE" ? "green" : "red" }}>{r.status}</span></p>

              <div style={{ marginTop: "16px" }}>
                <b>Availability:</b>
                {availabilityMap[r.id]?.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "13px" }}>
                    <span>{a.startTime} - {a.endTime}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button style={{ ...buttonStyles.primary, ...buttonStyles.small }} onClick={() => openEditAvailability(a)}>✏️</button>
                      <button style={{ ...buttonStyles.danger, ...buttonStyles.small }} onClick={() => handleDeleteAvailability(a.id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>

              {user?.role === "ADMIN" && (
                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                  <button style={buttonStyles.primary} onClick={() => openEditResource(r)}>✏️ Edit</button>
                  <button style={buttonStyles.danger} onClick={() => handleDeleteResource(r.id)}>🗑 Delete</button>
                </div>
              )}

              {r.status === "ACTIVE" && (
                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                  <button style={buttonStyles.success} onClick={() => openBookingModal(r)}>📅 Book</button>
                  {user?.role === "ADMIN" && (
                    <button style={buttonStyles.warning} onClick={() => openAddAvailability(r)}>➕ Add Slot</button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: "#6b7280", fontStyle: "italic", padding: "40px" }}>No resources match the selected filters.</p>
        )}
      </div>

      {/* ====================== MODALS ====================== */}

      {/* Your Bookings Modal - Edit & Delete in SAME LINE */}
      {showYourBookingsModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, width: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>📅 Your Bookings</h3>
              <button style={buttonStyles.danger} onClick={() => setShowYourBookingsModal(false)}>❌</button>
            </div>

            {yourBookings.map((b) => (
              <div key={b.id} style={{ 
                border: "1px solid #e5e7eb", 
                padding: "18px", 
                borderRadius: "10px", 
                marginBottom: "16px",
                background: "#fafafa"
              }}>
                <p><b>Booking ID:</b> {b.id}</p>
                <p><b>Resource:</b> {b.resourceName}</p>
                <p><b>Date:</b> {b.date}</p>
                <p><b>Time:</b> {b.startTime} - {b.endTime}</p>
                <p><b>Booked By:</b> {b.bookedBy}</p>

                {/* FIXED: Edit and Delete buttons in the same line */}
                <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                  <button style={buttonStyles.primary}>✏️ Edit</button>
                  <button style={buttonStyles.danger}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilterModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>🔍 Filters</h3>
            <div style={{ margin: "18px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Type</label>
              <select name="type" value={filters.type} onChange={handleFilterChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <option>All Types</option>
                <option>EQUIPMENT</option>
                <option>LECTURE_HALL</option>
                <option>COMPUTER_LAB</option>
              </select>
            </div>
            <div style={{ margin: "18px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Min Capacity</label>
              <input type="number" name="minCapacity" value={filters.minCapacity} onChange={handleFilterChange} placeholder="Enter minimum capacity" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "18px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Location</label>
              <select name="location" value={filters.location} onChange={handleFilterChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <option>All Locations</option>
                <option>Building A</option>
                <option>Building B</option>
                <option>Building D</option>
              </select>
            </div>
            <div style={{ margin: "18px 0 24px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <option>All Status</option>
                <option>ACTIVE</option>
                <option>OUT_OF_SERVICE</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button style={buttonStyles.primary} onClick={applyFilters}>Apply Filters</button>
              <button style={buttonStyles.danger} onClick={resetFilters}>Reset</button>
              <button style={{ ...buttonStyles.danger, background: "#6b7280" }} onClick={() => setShowFilterModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>🔔 Notifications</h3>
            <p style={{ textAlign: "center", padding: "50px 20px", color: "#6b7280" }}>No new notifications at the moment.</p>
            <button style={buttonStyles.danger} onClick={() => setShowNotificationsModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Booking History Modal */}
      {showBookingHistoryModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, width: "520px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>📚 Booking History</h3>
              <button style={buttonStyles.danger} onClick={() => setShowBookingHistoryModal(false)}>❌</button>
            </div>
            {yourBookings.map((b) => (
              <div key={b.id} style={{ border: "1px solid #e5e7eb", padding: "16px", borderRadius: "8px", marginBottom: "12px" }}>
                <p><b>Booking ID:</b> {b.id}</p>
                <p><b>Resource:</b> {b.resourceName}</p>
                <p><b>Date:</b> {b.date}</p>
                <p><b>Time:</b> {b.startTime} - {b.endTime}</p>
                <p><b>Booked By:</b> {b.bookedBy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incident Modal */}
      {showIncidentModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalContent, width: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>🚨 My Incident History</h3>
              <button style={buttonStyles.danger} onClick={() => setShowIncidentModal(false)}>✕ Close</button>
            </div>
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280" }}>
              <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>📭</p>
              <p><strong>No incidents reported yet</strong></p>
              <p>Click "Report Incident" to create your first incident</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {showEditResourceModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>✏️ Edit Resource</h3>
            <div style={{ margin: "16px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Name</label>
              <input name="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "16px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Location</label>
              <input name="location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "16px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Capacity</label>
              <input type="number" name="capacity" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "16px 0 24px 0" }}>
              <label style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Status</label>
              <select name="status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button style={buttonStyles.success} onClick={handleUpdateResource}>✅ Save Changes</button>
              <button style={buttonStyles.danger} onClick={() => setShowEditResourceModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {showEditAvailabilityModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>✏️ Edit Availability Slot</h3>
            <div style={{ margin: "16px 0" }}>
              <label>Date</label><br />
              <input type="date" style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "16px 0" }}>
              <label>Start Time</label><br />
              <input type="time" value={availabilityForm.startTime} onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "16px 0" }}>
              <label>End Time</label><br />
              <input type="time" value={availabilityForm.endTime} onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button style={buttonStyles.success} onClick={handleUpdateAvailability}>✅ Save Changes</button>
              <button style={buttonStyles.danger} onClick={() => setShowEditAvailabilityModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Availability Modal */}
      {showAddAvailabilityModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>📅 Add Availability: {selectedResource?.name}</h3>
            <div style={{ margin: "16px 0" }}>
              <label>Date *</label><br />
              <input type="date" style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "16px 0" }}>
              <label>Start Time *</label><br />
              <input type="time" value={availabilityForm.startTime} onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ margin: "16px 0" }}>
              <label>End Time *</label><br />
              <input type="time" value={availabilityForm.endTime} onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })} style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "6px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button style={buttonStyles.success} onClick={handleAddAvailability}>✅ Add Availability</button>
              <button style={buttonStyles.danger} onClick={() => setShowAddAvailabilityModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>📅 Book Resource</h3>
            <input type="date" value={bookingForm.date} onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })} style={{ width: "100%", padding: "10px", margin: "12px 0", borderRadius: "6px", border: "1px solid #ccc" }} />
            <input type="time" value={bookingForm.startTime} onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })} style={{ width: "100%", padding: "10px", margin: "12px 0", borderRadius: "6px", border: "1px solid #ccc" }} />
            <input type="time" value={bookingForm.endTime} onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })} style={{ width: "100%", padding: "10px", margin: "12px 0", borderRadius: "6px", border: "1px solid #ccc" }} />
            <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
              <button style={buttonStyles.success} onClick={handleBook}>✅ Confirm Booking</button>
              <button style={buttonStyles.danger} onClick={() => setShowBookingModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceList;