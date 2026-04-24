import { useState, useEffect } from "react";
import {
  getAllIncidents,
  deleteIncident,
  getIncidentUpdates,
  updateIncidentStatus,
  getAttachmentsByTicket,
  resolveIncident,
} from "../services/api";

function IncidentDashboard({ user }) {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // � RESOLVE MODAL STATE
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionText, setResolutionText] = useState("");
  const [staffMessage, setStaffMessage] = useState("");

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

  // �🔄 LOAD INCIDENTS
  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const res = await getAllIncidents();
      setIncidents(res.data);
    } catch (err) {
      alert("Error loading incidents: " + err.message);
    }
  };

  useEffect(() => {
    const filtered = incidents.filter((i) => i.status === statusFilter);
    setFilteredIncidents(filtered);
  }, [incidents, statusFilter]);

  // 🔍 FILTER BY STATUS
  const filterByStatus = (status) => {
    setStatusFilter(status);
  };

  // 👁️ VIEW INCIDENT DETAILS
  const viewIncidentDetails = async (incident) => {
    setSelectedIncident(incident);
    setLoading(true);

    try {
      // Load updates
      const updatesRes = await getIncidentUpdates(incident.id);
      setUpdates(updatesRes.data || []);

      // Load attachments
      const attachmentsRes = await getAttachmentsByTicket(incident.id);
      setAttachments(attachmentsRes.data || []);
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 UPDATE STATUS
  const changeStatus = async (ticketId, newStatus) => {
    if (newStatus === "RESOLVED") {
      // Open resolve modal instead of direct status change
      setShowResolveModal(true);
      return;
    }

    try {
      await updateIncidentStatus(ticketId, newStatus);
      alert("✅ Status updated successfully!");
      loadIncidents();
      setSelectedIncident(null);
    } catch (err) {
      alert("❌ Error updating status: " + err.message);
    }
  };

  const changeStatusFromTable = async (incident, newStatus) => {
    setSelectedIncident(incident);
    await changeStatus(incident.id, newStatus);
  };

  // ✅ RESOLVE INCIDENT WITH MESSAGE
  const handleResolve = async () => {
    if (!resolutionText.trim()) {
      alert("❌ Please provide a resolution description.");
      return;
    }

    try {
      await resolveIncident(selectedIncident.id, resolutionText, staffMessage);
      alert("✅ Incident resolved successfully!");
      setShowResolveModal(false);
      setResolutionText("");
      setStaffMessage("");
      loadIncidents();
      setSelectedIncident(null);
    } catch (err) {
      alert("❌ Error resolving incident: " + err.message);
    }
  };

  // 🗑️ DELETE INCIDENT
  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this incident?")) {
      return;
    }

    try {
      await deleteIncident(ticketId);
      alert("✅ Incident deleted successfully!");
      loadIncidents();
      setSelectedIncident(null);
    } catch (err) {
      alert("❌ Error deleting incident: " + err.message);
    }
  };

  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "#f5f5f5",
      minHeight: "100vh",
    },
    header: {
      fontSize: "28px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#222",
    },
    filterButtons: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
    },
    statusBtn: {
      padding: "8px 16px",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.3s",
    },
    statusBtnActive: {
      backgroundColor: "#22c55e",
      color: "white",
    },
    statusBtnInactive: {
      backgroundColor: "#e0e0e0",
      color: "#666",
    },
    incidentList: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      overflowX: "auto",
    },
    incidentTable: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "980px",
    },
    tableHeader: {
      textAlign: "left",
      padding: "12px 10px",
      backgroundColor: "#eef2f7",
      color: "#1f2937",
      fontSize: "13px",
    },
    tableCell: {
      padding: "10px",
      borderTop: "1px solid #e5e7eb",
      fontSize: "13px",
      color: "#374151",
    },
    incidentInfo: {
      fontSize: "13px",
      color: "#666",
      marginBottom: "5px",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "10px",
    },
    infoCard: {
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "10px",
    },
    infoLabel: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "6px",
      fontWeight: 600,
    },
    infoValue: {
      fontSize: "14px",
      color: "#111827",
      fontWeight: 600,
      wordBreak: "break-word",
    },
    priorityBadge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "3px",
      fontSize: "12px",
      fontWeight: "bold",
      marginRight: "5px",
    },
    priorityLow: {
      backgroundColor: "#d4edda",
      color: "#155724",
    },
    priorityMedium: {
      backgroundColor: "#fff3cd",
      color: "#856404",
    },
    priorityHigh: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
    },
    priorityCritical: {
      backgroundColor: "#f5c6cb",
      color: "#721c24",
    },
    statusBadge: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "3px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    statusOpen: {
      backgroundColor: "#cfe2ff",
      color: "#084298",
    },
    statusInProgress: {
      backgroundColor: "#fff3cd",
      color: "#664d03",
    },
    statusResolved: {
      backgroundColor: "#d1e7dd",
      color: "#0f5132",
    },
    statusClosed: {
      backgroundColor: "#e2e3e5",
      color: "#41464b",
    },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      width: "920px",
      maxWidth: "95vw",
      maxHeight: "90vh",
      overflowY: "auto",
      padding: "30px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    },
    modalHeaderRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      marginBottom: "14px",
    },
    modalCloseBtn: {
      background: "none",
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#374151",
      lineHeight: 1,
    },
    modalTitle: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "4px",
      color: "#222",
    },
    modalSubTitle: {
      fontSize: "13px",
      color: "#6b7280",
      margin: 0,
    },
    section: {
      marginBottom: "20px",
    },
    sectionTitle: {
      fontSize: "14px",
      fontWeight: "bold",
      color: "#333",
      marginBottom: "10px",
      borderBottom: "2px solid #f0f0f0",
      paddingBottom: "8px",
    },
    updateItem: {
      backgroundColor: "#f9f9f9",
      padding: "12px",
      borderRadius: "5px",
      marginBottom: "8px",
      borderLeft: "4px solid #22c55e",
    },
    updateMeta: {
      fontSize: "12px",
      color: "#888",
      marginBottom: "5px",
    },
    updateMessage: {
      fontSize: "14px",
      color: "#222",
    },
    attachmentItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px",
      backgroundColor: "#f0f0f0",
      borderRadius: "5px",
      marginBottom: "8px",
      fontSize: "13px",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
      flexWrap: "wrap",
    },
    actionBtn: {
      padding: "8px 16px",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
    },
    closeBtn: {
      backgroundColor: "#6c757d",
      color: "white",
    },
    primaryBtn: {
      backgroundColor: "#28a745",
      color: "white",
    },
    formGroup: {
      marginBottom: "15px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
      fontSize: "14px",
      color: "#333",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontSize: "14px",
      resize: "vertical",
      fontFamily: "inherit",
    },
    statusUpdateGroup: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    statusChangeBtn: {
      padding: "6px 12px",
      fontSize: "12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      cursor: "pointer",
      backgroundColor: "#fff",
    },
    tableActionGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    statusSelect: {
      padding: "8px 10px",
      borderRadius: "4px",
      border: "1px solid #d1d5db",
      backgroundColor: "#fff",
      cursor: "pointer",
      fontSize: "12px",
    },
    detailsBtn: {
      padding: "6px 10px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#2563eb",
      color: "#fff",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },
    tableDeleteBtn: {
      padding: "6px 10px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#dc2626",
      color: "#fff",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },
    rowActionButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return styles.priorityLow;
      case "MEDIUM":
        return styles.priorityMedium;
      case "HIGH":
        return styles.priorityHigh;
      case "CRITICAL":
        return styles.priorityCritical;
      default:
        return {};
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return styles.statusOpen;
      case "IN_PROGRESS":
        return styles.statusInProgress;
      case "RESOLVED":
        return styles.statusResolved;
      case "CLOSED":
        return styles.statusClosed;
      default:
        return {};
    }
  };

  // RESOLVE MODAL COMPONENT
  const ResolveModal = () => {
    if (!showResolveModal || !selectedIncident) return null;

    return (
      <div style={styles.modalOverlay} onClick={() => setShowResolveModal(false)}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalTitle}>
            ✅ Resolve Incident: {selectedIncident.title}
            <button
              onClick={() => setShowResolveModal(false)}
              style={{
                float: "right",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Resolution Details</div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Resolution Description *</label>
              <textarea
                style={styles.textarea}
                value={resolutionText}
                onChange={handleResolutionTextChange}
                placeholder="Describe how the incident was resolved..."
                rows={4}
              />
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#555" }}>
                {resolutionText.trim().split(/\s+/).filter(Boolean).length}/50 words
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Staff Message to User (Optional)</label>
              <textarea
                style={styles.textarea}
                value={staffMessage}
                onChange={handleStaffMessageChange}
                placeholder="Add a personal message to the user about this resolution..."
                rows={3}
              />
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#555" }}>
                {staffMessage.trim().split(/\s+/).filter(Boolean).length}/50 words
              </div>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.actionBtn, ...styles.primaryBtn }}
              onClick={handleResolve}
            >
              ✅ Resolve Incident
            </button>
            <button
              style={{ ...styles.actionBtn, ...styles.closeBtn }}
              onClick={() => setShowResolveModal(false)}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>🔧 Incident Management Dashboard</div>

      {/* STATUS FILTERS */}
      <div style={styles.filterButtons}>
        {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
          <button
            key={status}
            style={{
              ...styles.statusBtn,
              ...(statusFilter === status ? styles.statusBtnActive : styles.statusBtnInactive),
            }}
            onClick={() => filterByStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* INCIDENTS LIST */}
      <div style={styles.incidentList}>
        <table style={styles.incidentTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Title</th>
              <th style={styles.tableHeader}>Priority</th>
              <th style={styles.tableHeader}>Current Status</th>
              <th style={styles.tableHeader}>Reported By</th>
              <th style={styles.tableHeader}>Assigned To</th>
              <th style={styles.tableHeader}>Created</th>
              <th style={styles.tableHeader}>Action</th>
              <th style={styles.tableHeader}>Change Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((incident) => (
              <tr key={incident.id}>
                <td style={styles.tableCell}>{incident.title}</td>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.priorityBadge, ...getPriorityColor(incident.priority) }}>
                    {incident.priority}
                  </span>
                </td>
                <td style={styles.tableCell}>
                  <span style={{ ...styles.statusBadge, ...getStatusColor(incident.status) }}>
                    {incident.status}
                  </span>
                </td>
                <td style={styles.tableCell}>{incident.reportedBy}</td>
                <td style={styles.tableCell}>{incident.assignedTo || "Unassigned"}</td>
                <td style={styles.tableCell}>{new Date(incident.createdAt).toLocaleDateString()}</td>
                <td style={styles.tableCell}>
                  <div style={styles.rowActionButtons}>
                    <button
                      style={styles.detailsBtn}
                      onClick={() => viewIncidentDetails(incident)}
                    >
                      View
                    </button>
                    <button
                      style={styles.tableDeleteBtn}
                      onClick={() => handleDelete(incident.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
                <td style={styles.tableCell}>
                  <div style={styles.tableActionGroup}>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
                      Current: {incident.status}
                    </span>
                    <select
                      value={incident.status}
                      style={styles.statusSelect}
                      onChange={(event) => changeStatusFromTable(incident, event.target.value)}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {filteredIncidents.length === 0 && (
              <tr>
                <td style={{ ...styles.tableCell, textAlign: "center" }} colSpan={8}>
                  {loading ? "Loading incidents..." : "No incidents found for this status."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {selectedIncident && (
        <div style={styles.modalOverlay} onClick={() => setSelectedIncident(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeaderRow}>
              <div>
                <div style={styles.modalTitle}>📋 {selectedIncident.title}</div>
                <p style={styles.modalSubTitle}>Review details, update status, and view timeline and attachments.</p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                style={styles.modalCloseBtn}
                aria-label="Close incident details"
              >
                ×
              </button>
            </div>

            {/* INCIDENT INFO */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Incident Details</div>
              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>ID</div>
                  <div style={styles.infoValue}>{selectedIncident.id}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Resource</div>
                  <div style={styles.infoValue}>{selectedIncident.resourceId}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Priority</div>
                  <div style={styles.infoValue}>
                    <span style={{ ...styles.priorityBadge, ...getPriorityColor(selectedIncident.priority) }}>
                      {selectedIncident.priority}
                    </span>
                  </div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Status</div>
                  <div style={styles.infoValue}>
                    <span style={{ ...styles.statusBadge, ...getStatusColor(selectedIncident.status) }}>
                      {selectedIncident.status}
                    </span>
                  </div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Reported By</div>
                  <div style={styles.infoValue}>{selectedIncident.reportedBy}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Assigned To</div>
                  <div style={styles.infoValue}>{selectedIncident.assignedTo || "Unassigned"}</div>
                </div>
                <div style={{ ...styles.infoCard, gridColumn: "1 / -1" }}>
                  <div style={styles.infoLabel}>Description</div>
                  <div style={{ ...styles.infoValue, fontWeight: 500 }}>
                    {selectedIncident.description || "No description provided."}
                  </div>
                </div>
              </div>
            </div>

            {/* UPDATE STATUS */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Update Status</div>
              <div style={styles.statusUpdateGroup}>
                {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                  <button
                    key={status}
                    style={styles.statusChangeBtn}
                    onClick={() => changeStatus(selectedIncident.id, status)}
                    disabled={selectedIncident.status === status}
                  >
                    → {status}
                  </button>
                ))}
              </div>
            </div>

            {/* TIMELINE/UPDATES */}
            {updates.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Timeline ({updates.length})</div>
                {updates.map((update) => (
                  <div key={update.id} style={styles.updateItem}>
                    <div style={styles.updateMeta}>
                      <strong>{update.updatedBy}</strong> on{" "}
                      {new Date(update.createdAt).toLocaleString()} ({update.type})
                    </div>
                    <div style={styles.updateMessage}>{update.message}</div>
                    {update.timeSpentMinutes > 0 && (
                      <div style={styles.updateMeta}>⏱️ Time spent: {update.timeSpentMinutes} minutes</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ATTACHMENTS */}
            {attachments.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Attachments ({attachments.length})</div>
                {attachments.map((att) => (
                  <div key={att.id} style={styles.attachmentItem}>
                    <span>
                      📸 <strong>{att.fileName}</strong> ({(att.fileSize / 1024).toFixed(2)} KB)
                    </span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#888" }}>
                        by {att.uploadedBy}
                      </span>
                      <button
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                        onClick={() => window.open(`/api/attachments/${att.id}/download`, "_blank")}
                      >
                        👁️ View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIONS */}
            <div style={styles.buttonGroup}>
              <button
                style={{ ...styles.actionBtn, ...styles.closeBtn }}
                onClick={() => setSelectedIncident(null)}
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      <ResolveModal />
    </div>
  );
}

export default IncidentDashboard;
