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

  // 🎨 Modern UI Styles
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const modalStyle = {
    background: "white",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "900px",
    maxHeight: "85vh",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
  };

  const headerStyle = {
    background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const headerTitleStyle = {
    color: "white",
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const closeBtnStyle = {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    cursor: "pointer",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s ease",
  };

  const contentStyle = {
    padding: "24px",
    maxHeight: "calc(85vh - 80px)",
    overflowY: "auto",
  };

  const statsBarStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  };

  const statCardStyle = (color) => ({
    background: `linear-gradient(135deg, ${color}10 0%, ${color}20 100%)`,
    padding: "12px",
    borderRadius: "12px",
    textAlign: "center",
    borderLeft: `3px solid ${color}`,
  });

  const statValueStyle = {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "4px",
  };

  const statLabelStyle = {
    fontSize: "11px",
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "600",
  };

  const emptyStateStyle = {
    textAlign: "center",
    padding: "60px 20px",
  };

  const emptyStateIconStyle = {
    fontSize: "64px",
    marginBottom: "16px",
  };

  const emptyStateTextStyle = {
    fontSize: "16px",
    color: "#999",
    margin: 0,
  };

  const incidentCardStyle = {
    background: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const incidentHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "12px",
  };

  const incidentTitleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: 0,
  };

  const statusBadgeStyle = (status) => {
    const styles = {
      OPEN: {
        background: "#fff3cd",
        color: "#856404",
        icon: "🟡",
        label: "Open"
      },
      IN_PROGRESS: {
        background: "#cce5ff",
        color: "#004085",
        icon: "🔵",
        label: "In Progress"
      },
      RESOLVED: {
        background: "#d4edda",
        color: "#155724",
        icon: "✅",
        label: "Resolved"
      },
      CLOSED: {
        background: "#e2e3e5",
        color: "#383d41",
        icon: "✔️",
        label: "Closed"
      }
    };
    const style = styles[status] || styles.OPEN;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 12px",
      borderRadius: "20px",
      background: style.background,
      color: style.color,
      fontSize: "12px",
      fontWeight: "600",
    };
  };

  const descriptionStyle = {
    fontSize: "14px",
    color: "#4a5568",
    lineHeight: "1.5",
    marginBottom: "16px",
  };

  const metaGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  };

  const metaItemStyle = {
    fontSize: "12px",
  };

  const metaLabelStyle = {
    fontWeight: "600",
    color: "#4a5568",
    marginRight: "6px",
  };

  const metaValueStyle = {
    color: "#1a1a2e",
  };

  const priorityBadgeStyle = (priority) => {
    const priorities = {
      HIGH: { background: "#f8d7da", color: "#721c24", icon: "🔴" },
      MEDIUM: { background: "#fff3cd", color: "#856404", icon: "🟠" },
      LOW: { background: "#d4edda", color: "#155724", icon: "🟢" }
    };
    const style = priorities[priority] || priorities.MEDIUM;
    return {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "12px",
      background: style.background,
      color: style.color,
      fontSize: "11px",
      fontWeight: "600",
    };
  };

  const resolutionBoxStyle = {
    background: "#f8f9fa",
    padding: "12px",
    borderRadius: "12px",
    marginTop: "12px",
    borderLeft: "4px solid #28a745",
  };

  const resolutionTitleStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#28a745",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const resolutionTextStyle = {
    fontSize: "13px",
    color: "#1a1a2e",
    margin: 0,
    lineHeight: "1.5",
  };

  const resolveButtonStyle = {
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s ease",
  };

  // Inner Modal Styles
  const innerModalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2100,
  };

  const innerModalStyle = {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
  };

  const innerModalTitleStyle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "8px",
  };

  const innerModalSubtitleStyle = {
    fontSize: "13px",
    color: "#666",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #f0f0f0",
  };

  const textareaStyle = {
    width: "100%",
    padding: "12px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "all 0.3s ease",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  const errorStyle = {
    background: "#f8d7da",
    color: "#721c24",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  };

  const confirmButtonStyle = {
    flex: 1,
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const cancelButtonStyle = {
    flex: 1,
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  // Calculate statistics
  const stats = {
    total: myIncidents.length,
    open: myIncidents.filter(i => i.status === "OPEN").length,
    inProgress: myIncidents.filter(i => i.status === "IN_PROGRESS").length,
    resolved: myIncidents.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length,
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <h3 style={headerTitleStyle}>
            <span>🚨</span> My Incident History
          </h3>
          <button 
            onClick={onClose} 
            style={closeBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
            }}
          >
            ✕
          </button>
        </div>

        <div style={contentStyle}>
          {/* Statistics Cards */}
          <div style={statsBarStyle}>
            <div style={statCardStyle("#4361ee")}>
              <div style={statValueStyle}>{stats.total}</div>
              <div style={statLabelStyle}>Total Incidents</div>
            </div>
            <div style={statCardStyle("#f59e0b")}>
              <div style={statValueStyle}>{stats.open}</div>
              <div style={statLabelStyle}>Open</div>
            </div>
            <div style={statCardStyle("#0284c7")}>
              <div style={statValueStyle}>{stats.inProgress}</div>
              <div style={statLabelStyle}>In Progress</div>
            </div>
            <div style={statCardStyle("#22c55e")}>
              <div style={statValueStyle}>{stats.resolved}</div>
              <div style={statLabelStyle}>Resolved/Closed</div>
            </div>
          </div>

          {/* INCIDENT LIST */}
          {myIncidents.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyStateIconStyle}>📭</div>
              <p style={emptyStateTextStyle}>No incidents reported yet</p>
              <p style={{ fontSize: "12px", color: "#bbb", marginTop: "8px" }}>
                When you report incidents, they will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {myIncidents.map((incident) => (
                <div 
                  key={incident.id} 
                  style={incidentCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                >
                  <div style={incidentHeaderStyle}>
                    <h4 style={incidentTitleStyle}>{incident.title}</h4>
                    <span style={statusBadgeStyle(incident.status)}>
                      {statusBadgeStyle(incident.status).icon} {incident.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p style={descriptionStyle}>{incident.description}</p>

                  <div style={metaGridStyle}>
                    <div style={metaItemStyle}>
                      <span style={metaLabelStyle}>Priority:</span>
                      <span style={priorityBadgeStyle(incident.priority)}>
                        {incident.priority}
                      </span>
                    </div>
                    <div style={metaItemStyle}>
                      <span style={metaLabelStyle}>Category:</span>
                      <span style={metaValueStyle}>{incident.category}</span>
                    </div>
                    <div style={metaItemStyle}>
                      <span style={metaLabelStyle}>Reported:</span>
                      <span style={metaValueStyle}>
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {(incident.status !== "RESOLVED" && incident.status !== "CLOSED") && (
                    <button 
                      onClick={() => openResolve(incident)} 
                      style={resolveButtonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(40, 167, 69, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      ✅ Mark as Resolved
                    </button>
                  )}

                  {incident.resolution && (
                    <div style={resolutionBoxStyle}>
                      <div style={resolutionTitleStyle}>
                        <span>🔧</span> Resolution
                      </div>
                      <p style={resolutionTextStyle}>{incident.resolution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESOLVE MODAL */}
        {showResolveModal && selectedIncident && (
          <div style={innerModalOverlayStyle}>
            <div style={innerModalStyle}>
              <h3 style={innerModalTitleStyle}>Resolve Incident</h3>
              <div style={innerModalSubtitleStyle}>
                {selectedIncident.title}
              </div>

              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe how this incident was resolved..."
                rows={4}
                style={textareaStyle}
                onFocus={(e) => e.target.style.borderColor = "#28a745"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />

              <textarea
                value={staffMessage}
                onChange={(e) => setStaffMessage(e.target.value)}
                placeholder="Optional: Add a message to the user..."
                rows={3}
                style={textareaStyle}
                onFocus={(e) => e.target.style.borderColor = "#28a745"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />

              {error && (
                <div style={errorStyle}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <div style={buttonGroupStyle}>
                <button 
                  onClick={handleResolve} 
                  disabled={loading} 
                  style={confirmButtonStyle}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {loading ? "Resolving..." : "Confirm Resolution"}
                </button>

                <button
                  onClick={() => setShowResolveModal(false)}
                  style={cancelButtonStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#5a6268";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#6c757d";
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