import { useState, useEffect } from "react";
import {
  getAllIncidents,
  deleteIncident,
  getIncidentUpdates,
  updateIncidentStatus,
  getAttachmentsByTicket,
} from "../services/api";

function IncidentDashboard({ user }) {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  // 🔄 LOAD INCIDENTS
  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const res = await getAllIncidents();
      setIncidents(res.data);
      filterByStatus("OPEN");
    } catch (err) {
      alert("Error loading incidents: " + err.message);
    }
  };

  // 🔍 FILTER BY STATUS
  const filterByStatus = (status) => {
    setStatusFilter(status);
    const filtered = incidents.filter((i) => i.status === status);
    setFilteredIncidents(filtered);
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
    try {
      await updateIncidentStatus(ticketId, newStatus);
      alert("✅ Status updated successfully!");
      loadIncidents();
      setSelectedIncident(null);
    } catch (err) {
      alert("❌ Error updating status: " + err.message);
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
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "15px",
    },
    incidentCard: {
      backgroundColor: "white",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      cursor: "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    incidentCardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    },
    incidentTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#222",
      marginBottom: "8px",
    },
    incidentInfo: {
      fontSize: "13px",
      color: "#666",
      marginBottom: "5px",
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
      borderRadius: "10px",
      width: "800px",
      maxHeight: "90vh",
      overflowY: "auto",
      padding: "30px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    },
    modalTitle: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#222",
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
    updateBtn: {
      backgroundColor: "#007bff",
      color: "white",
    },
    deleteBtn: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    closeBtn: {
      backgroundColor: "#6c757d",
      color: "white",
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
        {filteredIncidents.map((incident) => (
          <div
            key={incident.id}
            style={styles.incidentCard}
            onClick={() => viewIncidentDetails(incident)}
          >
            <div style={styles.incidentTitle}>{incident.title}</div>
            <div style={styles.incidentInfo}>
              <div>
                <span style={{ ...styles.priorityBadge, ...getPriorityColor(incident.priority) }}>
                  {incident.priority}
                </span>
                <span style={{ ...styles.statusBadge, ...getStatusColor(incident.status) }}>
                  {incident.status}
                </span>
              </div>
            </div>
            <div style={styles.incidentInfo}>
              <strong>Reported by:</strong> {incident.reportedBy}
            </div>
            <div style={styles.incidentInfo}>
              <strong>Assigned to:</strong> {incident.assignedTo || "Unassigned"}
            </div>
            <div style={styles.incidentInfo}>
              <strong>Created:</strong> {new Date(incident.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      {selectedIncident && (
        <div style={styles.modalOverlay} onClick={() => setSelectedIncident(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>
              📋 {selectedIncident.title}
              <button
                onClick={() => setSelectedIncident(null)}
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

            {/* INCIDENT INFO */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Incident Details</div>
              <div style={styles.incidentInfo}>
                <strong>ID:</strong> {selectedIncident.id}
              </div>
              <div style={styles.incidentInfo}>
                <strong>Description:</strong> {selectedIncident.description}
              </div>
              <div style={styles.incidentInfo}>
                <strong>Resource:</strong> {selectedIncident.resourceId}
              </div>
              <div style={styles.incidentInfo}>
                <strong>Priority:</strong>
                <span style={{ ...styles.priorityBadge, ...getPriorityColor(selectedIncident.priority) }}>
                  {selectedIncident.priority}
                </span>
              </div>
              <div style={styles.incidentInfo}>
                <strong>Status:</strong>
                <span style={{ ...styles.statusBadge, ...getStatusColor(selectedIncident.status) }}>
                  {selectedIncident.status}
                </span>
              </div>
              <div style={styles.incidentInfo}>
                <strong>Reported by:</strong> {selectedIncident.reportedBy}
              </div>
              <div style={styles.incidentInfo}>
                <strong>Assigned to:</strong> {selectedIncident.assignedTo || "Unassigned"}
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
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      by {att.uploadedBy}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIONS */}
            <div style={styles.buttonGroup}>
              <button
                style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                onClick={() => handleDelete(selectedIncident.id)}
              >
                🗑️ Delete Incident
              </button>
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
    </div>
  );
}

export default IncidentDashboard;
