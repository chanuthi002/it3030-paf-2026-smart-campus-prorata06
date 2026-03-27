import { useState } from "react";
import { createIncident } from "../services/api";

function ReportIncidentForm({ resources, user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    resourceId: "",
    priority: "MEDIUM",
    category: "MAINTENANCE",
  });

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 🔹 HANDLE TEXT INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // 🔹 HANDLE FILE INPUT
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (images only)
    const validFiles = files.filter(file => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      setErrors({ ...errors, file: "Only image files (JPEG, PNG, GIF, WebP) are allowed" });
      return;
    }

    setAttachments([...attachments, ...validFiles]);
  };

  // 🔹 REMOVE ATTACHMENT
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // 🔹 VALIDATION
  const validate = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.resourceId) newErrors.resourceId = "Resource is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 SUBMIT INCIDENT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);

    try {
      // 1️⃣ CREATE INCIDENT TICKET
      const incidentData = {
        title: form.title,
        description: form.description,
        resourceId: form.resourceId,
        priority: form.priority,
        category: form.category,
        reportedBy: user.name,
        reportedByUserId: user.id,
      };

      const ticketResponse = await createIncident(incidentData);
      const ticketId = ticketResponse.data.id;

      // 2️⃣ UPLOAD ATTACHMENTS
      if (attachments.length > 0) {
        for (const file of attachments) {
          const formData = new FormData();
          formData.append("ticketId", ticketId);
          formData.append("uploadedByUserId", user.id);
          formData.append("uploadedByName", user.name);
          formData.append("description", `Image attachment for incident ${ticketId}`);
          formData.append("file", file);

          await fetch("http://localhost:8080/api/attachments/upload", {
            method: "POST",
            body: formData,
          });
        }
      }

      alert("✅ Incident reported successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      alert("❌ Error reporting incident: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    overlay: {
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
    modal: {
      backgroundColor: "#fff",
      padding: "30px",
      borderRadius: "10px",
      width: "600px",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#222",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    },
    label: {
      fontWeight: "600",
      color: "#333",
      fontSize: "14px",
    },
    input: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "5px",
      fontSize: "14px",
      fontFamily: "Arial",
    },
    textarea: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "5px",
      fontSize: "14px",
      fontFamily: "Arial",
      minHeight: "100px",
      resize: "vertical",
    },
    select: {
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "5px",
      fontSize: "14px",
    },
    error: {
      color: "#d32f2f",
      fontSize: "12px",
      marginTop: "3px",
    },
    fileInput: {
      padding: "8px",
      border: "2px dashed #ddd",
      borderRadius: "5px",
      cursor: "pointer",
      backgroundColor: "#f9f9f9",
    },
    attachmentList: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginTop: "10px",
    },
    attachment: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 12px",
      backgroundColor: "#f0f0f0",
      borderRadius: "5px",
      fontSize: "13px",
    },
    removeBtn: {
      backgroundColor: "#ff6b6b",
      color: "white",
      border: "none",
      padding: "4px 8px",
      borderRadius: "3px",
      cursor: "pointer",
      fontSize: "12px",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
      justifyContent: "flex-end",
    },
    submitBtn: {
      padding: "10px 20px",
      backgroundColor: "#22c55e",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "600",
      disabled: loading,
    },
    cancelBtn: {
      padding: "10px 20px",
      backgroundColor: "#ccc",
      color: "#333",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.title}>📋 Report Incident</div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* TITLE */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.title && <span style={styles.error}>{errors.title}</span>}
          </div>

          {/* DESCRIPTION */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description *</label>
            <textarea
              name="description"
              placeholder="Detailed description of the incident"
              value={form.description}
              onChange={handleChange}
              style={styles.textarea}
            />
            {errors.description && <span style={styles.error}>{errors.description}</span>}
          </div>

          {/* RESOURCE */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Affected Resource *</label>
            <select
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Select a resource</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
            {errors.resourceId && <span style={styles.error}>{errors.resourceId}</span>}
          </div>

          {/* PRIORITY */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🔴 High</option>
              <option value="CRITICAL">⛔ Critical</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="MAINTENANCE">🔧 Maintenance</option>
              <option value="REPAIR">🛠️ Repair</option>
              <option value="ISSUE">⚠️ Issue</option>
              <option value="FEEDBACK">💬 Feedback</option>
              <option value="OTHER">❓ Other</option>
            </select>
          </div>

          {/* ATTACHMENTS */}
          <div style={styles.formGroup}>
            <label style={styles.label}>📸 Attach Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            {errors.file && <span style={styles.error}>{errors.file}</span>}

            {attachments.length > 0 && (
              <div style={styles.attachmentList}>
                <strong>Attached files ({attachments.length}):</strong>
                {attachments.map((file, index) => (
                  <div key={index} style={styles.attachment}>
                    <span>📷 {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    <button
                      type="button"
                      style={styles.removeBtn}
                      onClick={() => removeAttachment(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "⏳ Reporting..." : "✅ Report Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportIncidentForm;
