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
                  placeholder="Brief description of the issue"
                  style={{
                    ...styles.input,
                    borderColor: touched.title && errors.title ? "#d32f2f" : "#ddd",
                  }}
                />
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
                  placeholder="Detailed description of the incident"
                  style={{
                    ...styles.textarea,
                    borderColor: touched.description && errors.description ? "#d32f2f" : "#ddd",
                  }}
                />
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
                  <option value="">Select a resource</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </Field>
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
