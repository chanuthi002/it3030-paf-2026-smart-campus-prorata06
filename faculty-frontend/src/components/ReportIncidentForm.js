import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createIncident } from "../services/api";
import { reportIncidentSchema } from "../utils/validationSchemas";
import { countWords } from "../utils/validationHelpers";

function ReportIncidentForm({ resources, user, onClose, onSuccess }) {
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 HANDLE FILE INPUT
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileError("");
    
    // Validate file types (images only)
    const validFiles = files.filter(file => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      setFileError("Only image files (JPEG, PNG, GIF, WebP) are allowed");
      return;
    }

    setAttachments([...attachments, ...validFiles]);
  };

  // 🔹 REMOVE ATTACHMENT
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // 🔹 SUBMIT INCIDENT (FORMIK HANDLES VALIDATION)
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);

    try {
      // 1️⃣ CREATE INCIDENT TICKET
      const incidentData = {
        title: values.title.trim(),
        description: values.description.trim(),
        resourceId: values.resourceId,
        priority: values.priority,
        category: values.category,
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
      setSubmitting(false);
    }
  };

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(15, 23, 42, 0.45)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "16px",
    },
    modal: {
      backgroundColor: "#fff",
      padding: "24px",
      borderRadius: "12px",
      width: "min(680px, 100%)",
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.2)",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      marginBottom: "6px",
      color: "#222",
    },
    subtitle: {
      margin: "0 0 16px 0",
      color: "#4b5563",
      fontSize: "14px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    label: {
      fontWeight: "600",
      color: "#333",
      fontSize: "14px",
    },
    helper: {
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "-2px",
    },
    input: {
      padding: "11px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      fontFamily: "Arial",
      outline: "none",
    },
    textarea: {
      padding: "11px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      fontFamily: "Arial",
      minHeight: "100px",
      resize: "vertical",
      outline: "none",
    },
    select: {
      padding: "11px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      backgroundColor: "#fff",
    },
    error: {
      color: "#d32f2f",
      fontSize: "12px",
      marginTop: "3px",
    },
    fileInput: {
      padding: "8px",
      border: "2px dashed #d1d5db",
      borderRadius: "8px",
      cursor: "pointer",
      backgroundColor: "#f9fafb",
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

  const sortedResources = [...resources].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.title}>📋 Report Incident</div>
        <p style={styles.subtitle}>Share the issue details and we will notify the maintenance team.</p>

        <Formik
          initialValues={{
            title: "",
            description: "",
            resourceId: "",
            priority: "MEDIUM",
            category: "MAINTENANCE",
          }}
          validationSchema={reportIncidentSchema}
          onSubmit={handleSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, errors, touched, isSubmitting, isValid }) => (
            <Form style={styles.form}>
              {/* TITLE */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Title * 
                  {values.title && (
                    <span style={{ fontSize: "12px", color: "#666", marginLeft: "5px" }}>
                      ({countWords(values.title)} words)
                    </span>
                  )}
                </label>
                <Field
                  type="text"
                  name="title"
                  placeholder="Ex: Projector not turning on"
                  style={{
                    ...styles.input,
                    borderColor: touched.title && errors.title ? "#d32f2f" : "#ddd",
                  }}
                />
                <span style={styles.helper}>Keep it short and specific.</span>
                <ErrorMessage name="title" component="span" style={styles.error} />
              </div>

              {/* DESCRIPTION */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Description * 
                  {values.description && (
                    <span style={{ fontSize: "12px", color: "#666", marginLeft: "5px" }}>
                      ({countWords(values.description)} words)
                    </span>
                  )}
                </label>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="What happened, where it happened, and when you noticed it"
                  style={{
                    ...styles.textarea,
                    borderColor: touched.description && errors.description ? "#d32f2f" : "#ddd",
                  }}
                />
                <span style={styles.helper}>Include key details to help technicians respond faster.</span>
                <ErrorMessage name="description" component="span" style={styles.error} />
              </div>

              {/* RESOURCE */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Affected Resource *</label>
                <Field
                  as="select"
                  name="resourceId"
                  style={{
                    ...styles.select,
                    borderColor: touched.resourceId && errors.resourceId ? "#d32f2f" : "#ddd",
                  }}
                >
                  <option value="" disabled>
                    Select affected resource
                  </option>
                  {sortedResources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </Field>
                {sortedResources.length === 0 && (
                  <span style={styles.helper}>No resources available right now.</span>
                )}
                <ErrorMessage name="resourceId" component="span" style={styles.error} />
              </div>

              {/* PRIORITY */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <Field as="select" name="priority" style={styles.select}>
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HIGH">🔴 High</option>
                  <option value="CRITICAL">⛔ Critical</option>
                </Field>
              </div>

              {/* CATEGORY */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <Field as="select" name="category" style={styles.select}>
                  <option value="MAINTENANCE">🔧 Maintenance</option>
                  <option value="REPAIR">🛠️ Repair</option>
                  <option value="ISSUE">⚠️ Issue</option>
                  <option value="FEEDBACK">💬 Feedback</option>
                  <option value="OTHER">❓ Other</option>
                </Field>
              </div>

              {/* ATTACHMENTS */}
              <div style={styles.formGroup}>
                <label style={styles.label}>📸 Attach Images</label>
                <span style={styles.helper}>Optional: upload clear photos of the issue.</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                />
                {fileError && <span style={styles.error}>{fileError}</span>}

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
                  disabled={loading || isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={loading || isSubmitting || !isValid}
                >
                  {loading ? "⏳ Reporting..." : "✅ Report Incident"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default ReportIncidentForm;
