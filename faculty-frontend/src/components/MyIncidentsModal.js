import React, { useState } from "react";
import { resolveIncident } from "../services/api";

function MyIncidentsModal({ myIncidents, onClose, onResolved = () => {} }) {
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resolutionText, setResolutionText] = useState("");
  const [staffMessage, setStaffMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enforceWordLimit = (value, limit = 50) => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length <= limit) return value;
    return words.slice(0, limit).join(" ");
  };

  const handleResolutionTextChange = (e) => {
    setResolutionText(enforceWordLimit(e.target.value, 50));
  };

  const handleStaffMessageChange = (e) => {
    setStaffMessage(enforceWordLimit(e.target.value, 50));
  };

  const openResolve = (incident) => {
    setSelectedIncident(incident);
    setResolutionText("");
    setStaffMessage("");
    setError(null);
    setShowResolveModal(true);
  };

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
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "30px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0 }}>🚨 My Incident History</h3>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ✕ Close
          </button>
        </div>

        {myIncidents.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
            }}
          >
            <p style={{ fontSize: "18px" }}>📭 No incidents reported yet</p>
            <p style={{ fontSize: "14px" }}>
              Click "Report Incident" to create your first incident
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {myIncidents.map((incident) => (
              <div
                key={incident.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: "0", color: "#333" }}>{incident.title}</h4>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor:
                        incident.status === "OPEN"
                          ? "#fff3cd"
                          : incident.status === "IN_PROGRESS"
                          ? "#cce5ff"
                          : incident.status === "RESOLVED"
                          ? "#d4edda"
                          : "#f8d7da",
                      color:
                        incident.status === "OPEN"
                          ? "#856404"
                          : incident.status === "IN_PROGRESS"
                          ? "#004085"
                          : incident.status === "RESOLVED"
                          ? "#155724"
                          : "#721c24",
                    }}
                  >
                    {incident.status}
                  </span>
                </div>

                {(incident.status !== "RESOLVED" && incident.status !== "CLOSED") && (
                  <button
                    onClick={() => openResolve(incident)}
                    style={{
                      marginBottom: "10px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    ✅ Resolve
                  </button>
                )}

                <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
                  {incident.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginTop: "10px",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  <span>
                    <b>Priority:</b> {incident.priority}
                  </span>
                  <span>
                    <b>Category:</b> {incident.category}
                  </span>
                  <span>
                    <b>Reported:</b> {new Date(incident.createdAt).toLocaleDateString()}
                  </span>
                  {incident.resolvedAt && (
                    <span>
                      <b>Resolved:</b> {new Date(incident.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {incident.resolution && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#e8f5e8",
                      borderRadius: "4px",
                      borderLeft: "4px solid #28a745",
                    }}
                  >
                    <b style={{ color: "#155724" }}>Resolution:</b>
                    <p style={{ margin: "5px 0 0 0", color: "#155724" }}>
                      {incident.resolution}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      {showResolveModal && selectedIncident && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2100,
          }}
          onClick={() => setShowResolveModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>✅ Resolve: {selectedIncident.title}</h3>
            <p style={{ color: "#666", marginTop: 0 }}>
              {selectedIncident.description}
            </p>

            <div>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                Resolution Description *
              </label>
              <textarea
                value={resolutionText}
                onChange={handleResolutionTextChange}
                rows={4}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#555" }}>
                {resolutionText.trim().split(/\s+/).filter(Boolean).length}/50 words
              </div>
            </div>

            <div style={{ marginTop: "10px" }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                Staff Message (optional)
              </label>
              <textarea
                value={staffMessage}
                onChange={handleStaffMessageChange}
                rows={3}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#555" }}>
                {staffMessage.trim().split(/\s+/).filter(Boolean).length}/50 words
              </div>
            </div>

            {error && (
              <p style={{ color: "#dc3545", marginTop: "10px" }}>{error}</p>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button
                onClick={handleResolve}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Resolving..." : "✅ Confirm Resolve"}
              </button>
              <button
                onClick={() => setShowResolveModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  padding: "10px",
                  cursor: "pointer",
                }}
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

export default MyIncidentsModal;
