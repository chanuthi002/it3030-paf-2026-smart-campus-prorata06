import { Formik, Form, Field, ErrorMessage } from "formik";
import { createAvailability } from "../services/api";
import { availabilitySchema } from "../utils/validationSchemas";

function AvailabilityForm({ resource, refresh }) {
  const today = new Date();
  const maxDateObj = new Date(today);
  maxDateObj.setMonth(maxDateObj.getMonth() + 1);

  const minDate = today.toISOString().split("T")[0];
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const validateDateRange = (dateValue) => {
    if (!dateValue) return undefined;
    if (dateValue < minDate) return "Past dates are not allowed";
    if (dateValue > maxDate) return "You can only book within one month";
    return undefined;
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const dateError = validateDateRange(values.date);
    if (dateError) {
      alert(dateError);
      setSubmitting(false);
      return;
    }

    try {
      await createAvailability(values);
      alert("✅ Availability Added!");
      resetForm();
      if (refresh) refresh();
    } catch (err) {
      alert("❌ " + (err.response?.data || "Error adding availability"));
    } finally {
      setSubmitting(false);
    }
  };

  // 🎨 Modern UI Styles
  const styles = {
    container: {
      padding: "0",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      padding: "20px 24px",
      marginBottom: "24px",
    },
    title: {
      color: "white",
      margin: 0,
      fontSize: "20px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    resourceName: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.9)",
      marginTop: "8px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    form: {
      padding: "0 24px 24px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontWeight: "600",
      color: "#4a5568",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      letterSpacing: "0.3px",
    },
    input: {
      padding: "12px 16px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "14px",
      fontFamily: "inherit",
      transition: "all 0.3s ease",
      outline: "none",
      backgroundColor: "#f8f9fa",
    },
    inputFocus: {
      borderColor: "#f59e0b",
      backgroundColor: "white",
    },
    inputError: {
      borderColor: "#dc3545",
      backgroundColor: "#fff5f5",
    },
    error: {
      color: "#dc3545",
      fontSize: "11px",
      marginTop: "4px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    button: {
      padding: "14px 20px",
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "8px",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    disabledButton: {
      opacity: 0.6,
      cursor: "not-allowed",
      transform: "none",
    },
    infoBox: {
      background: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
      padding: "12px 16px",
      borderRadius: "10px",
      marginBottom: "20px",
      borderLeft: "4px solid #f59e0b",
    },
    infoText: {
      fontSize: "12px",
      color: "#92400e",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    dateHint: {
      fontSize: "10px",
      color: "#b45309",
      marginTop: "4px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <span>📅</span> Add Availability
        </h3>
        {resource && (
          <div style={styles.resourceName}>
            <span>🏷️</span> {resource.name}
          </div>
        )}
      </div>

      <Formik
        initialValues={{
          resourceId: resource?.id || "",
          date: "",
          startTime: "",
          endTime: "",
        }}
        validationSchema={availabilitySchema}
        validate={(values) => {
          const errors = {};
          const dateError = validateDateRange(values.date);
          if (dateError) {
            errors.date = dateError;
          }
          return errors;
        }}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ errors, touched, isSubmitting, isValid, values, handleChange, handleBlur }) => (
          <Form style={styles.form}>
            {/* RESOURCE ID (Hidden) */}
            <Field type="hidden" name="resourceId" value={resource?.id || ""} />

            {/* Info Box */}
            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                <span>ℹ️</span> You can add availability slots for the next 30 days only
              </p>
            </div>

            {/* DATE */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span>📆</span> Select Date *
              </label>
              <Field
                type="date"
                name="date"
                min={minDate}
                max={maxDate}
                style={{
                  ...styles.input,
                  ...(touched.date && errors.date ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f59e0b";
                  e.target.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  if (!errors.date) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                  }
                }}
              />
              <ErrorMessage name="date">
                {(msg) => (
                  <span style={styles.error}>
                    <span>⚠️</span> {msg}
                  </span>
                )}
              </ErrorMessage>
              {!errors.date && values.date && (
                <div style={styles.dateHint}>
                  ✅ Selected: {new Date(values.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>

            {/* START TIME */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span>⏰</span> Start Time *
              </label>
              <Field
                type="time"
                name="startTime"
                style={{
                  ...styles.input,
                  ...(touched.startTime && errors.startTime ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f59e0b";
                  e.target.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  if (!errors.startTime) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                  }
                }}
              />
              <ErrorMessage name="startTime">
                {(msg) => (
                  <span style={styles.error}>
                    <span>⚠️</span> {msg}
                  </span>
                )}
              </ErrorMessage>
            </div>

            {/* END TIME */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span>⏰</span> End Time *
              </label>
              <Field
                type="time"
                name="endTime"
                style={{
                  ...styles.input,
                  ...(touched.endTime && errors.endTime ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f59e0b";
                  e.target.style.backgroundColor = "white";
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  if (!errors.endTime) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f9fa";
                  }
                }}
              />
              <ErrorMessage name="endTime">
                {(msg) => (
                  <span style={styles.error}>
                    <span>⚠️</span> {msg}
                  </span>
                )}
              </ErrorMessage>
            </div>

            {/* Time Preview */}
            {values.startTime && values.endTime && !errors.startTime && !errors.endTime && (
              <div style={{
                background: "#e8f5e9",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#2e7d32",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span>✅</span>
                <span>Time slot: <strong>{values.startTime} - {values.endTime}</strong></span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              style={{
                ...styles.button,
                ...(isSubmitting || !isValid ? styles.disabledButton : {}),
              }}
              disabled={isSubmitting || !isValid}
              onMouseEnter={(e) => {
                if (!(isSubmitting || !isValid)) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(isSubmitting || !isValid)) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <span>⏳</span> Adding Availability...
                </>
              ) : (
                <>
                  <span>✅</span> Add Availability
                </>
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AvailabilityForm;