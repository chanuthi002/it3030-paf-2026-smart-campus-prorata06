import React, { useState } from "react";
import { resolveIncident } from "../services/api";

function MyIncidentsModal({ myIncidents, onClose, onResolved = () => {} }) {
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resolutionText, setResolutionText] = useState("");
  const [staffMessage, setStaffMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Open modal safely
  const openResolve = (incident) => {
    setSelectedIncident(incident);
    setResolutionText("");
    setStaffMessage("");
    setError(null);
    setShowResolveModal(true);
  };

  // ✅ Handle resolve
  const handleResolve = async () => {
    if (!resolutionText.trim()) {
      setError("Please provide a resolution description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resolveIncident(selectedIncident.id, resolutionText, staffMessage);
      setShowResolveModal(false);
      setSelectedIncident(null);
      onResolved();
    } catch (err) {
      setError(err.response?.data || err.message || "Error resolving incident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        {/* HEADER */}
        <div style={headerStyle}>
          <h3>🚨 My Incident History</h3>
          <button onClick={onClose} style={closeBtn}>✕ Close</button>
        </div>

        {/* INCIDENT LIST */}
        {myIncidents.length === 0 ? (
          <div style={emptyStyle}>
            <p>📭 No incidents reported yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {myIncidents.map((incident) => (
              <div key={incident.id} style={cardStyle}>

                <div style={cardHeader}>
                  <h4>{incident.title}</h4>
                  <span style={getStatusStyle(incident.status)}>
                    {incident.status}
                  </span>
                </div>

                {(incident.status !== "RESOLVED" && incident.status !== "CLOSED") && (
                  <button onClick={() => openResolve(incident)} style={resolveBtn}>
                    ✅ Resolve
                  </button>
                )}

                <p>{incident.description}</p>

                <div style={metaStyle}>
                  <span><b>Priority:</b> {incident.priority}</span>
                  <span><b>Category:</b> {incident.category}</span>
                  <span><b>Date:</b> {new Date(incident.createdAt).toLocaleDateString()}</span>
                </div>

                {incident.resolution && (
                  <div style={resolutionBox}>
                    <b>Resolution:</b>
                    <p>{incident.resolution}</p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {/* ✅ FIXED RESOLVE MODAL */}
        {showResolveModal && selectedIncident && (
          <div style={overlayStyle}>
            <div
              style={innerModal}
              onClick={(e) => e.stopPropagation()} // prevent closing on typing
            >
              <h3>Resolve: {selectedIncident.title}</h3>

              {/* ✅ NO LOGIC INSIDE INPUT (IMPORTANT FIX) */}
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Enter resolution..."
                rows={4}
                style={inputStyle}
              />

              <textarea
                value={staffMessage}
                onChange={(e) => setStaffMessage(e.target.value)}
                placeholder="Staff message (optional)"
                rows={3}
                style={inputStyle}
              />

              {error && <p style={{ color: "red" }}>{error}</p>}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleResolve} disabled={loading} style={resolveBtn}>
                  {loading ? "Resolving..." : "Confirm"}
                </button>

                <button
                  onClick={() => setShowResolveModal(false)}
                  style={cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
};

const modalStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "800px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
};

const closeBtn = {
  background: "red",
  color: "white",
  border: "none",
  padding: "6px",
};

const emptyStyle = {
  textAlign: "center",
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  borderRadius: "8px",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
};

const resolveBtn = {
  background: "green",
  color: "white",
  border: "none",
  padding: "6px",
};

const cancelBtn = {
  background: "gray",
  color: "white",
  border: "none",
  padding: "6px",
};

const metaStyle = {
  display: "flex",
  gap: "10px",
  fontSize: "12px",
};

const resolutionBox = {
  background: "#e8f5e8",
  padding: "8px",
  marginTop: "5px",
};

const innerModal = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "400px",
};

const inputStyle = {
  width: "100%",
  marginBottom: "10px",
  padding: "8px",
};

const getStatusStyle = (status) => ({
  padding: "3px 8px",
  borderRadius: "4px",
  background:
    status === "OPEN"
      ? "#fff3cd"
      : status === "IN_PROGRESS"
      ? "#cce5ff"
      : "#d4edda",
});

export default MyIncidentsModal;