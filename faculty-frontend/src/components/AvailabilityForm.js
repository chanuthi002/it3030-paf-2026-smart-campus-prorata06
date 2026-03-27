import { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { createAvailability } from "../services/api";
import { availabilitySchema } from "../utils/validationSchemas";

function AvailabilityForm({ resource, refresh }) {
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
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

  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "5px",
      maxWidth: "500px",
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
    error: {
      color: "#d32f2f",
      fontSize: "12px",
      marginTop: "3px",
    },
    button: {
      padding: "12px 20px",
      backgroundColor: "#22c55e",
      color: "white",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "10px",
    },
    disabledButton: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  };

  return (
    <div style={styles.container}>
      <h3>📅 Add Availability{resource ? `: ${resource.name}` : ""}</h3>

      <Formik
        initialValues={{
          resourceId: resource?.id || "",
          date: "",
          startTime: "",
          endTime: "",
        }}
        validationSchema={availabilitySchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ errors, touched, isSubmitting, isValid }) => (
          <Form style={styles.form}>
            {/* RESOURCE ID (Hidden/Disabled) */}
            <Field
              type="hidden"
              name="resourceId"
              value={resource?.id || ""}
            />

            {/* DATE */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Date *</label>
              <Field
                type="date"
                name="date"
                style={{
                  ...styles.input,
                  borderColor: touched.date && errors.date ? "#d32f2f" : "#ddd",
                }}
              />
              <ErrorMessage name="date" component="span" style={styles.error} />
            </div>

            {/* START TIME */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Time *</label>
              <Field
                type="time"
                name="startTime"
                style={{
                  ...styles.input,
                  borderColor: touched.startTime && errors.startTime ? "#d32f2f" : "#ddd",
                }}
              />
              <ErrorMessage name="startTime" component="span" style={styles.error} />
            </div>

            {/* END TIME */}
            <div style={styles.formGroup}>
              <label style={styles.label}>End Time *</label>
              <Field
                type="time"
                name="endTime"
                style={{
                  ...styles.input,
                  borderColor: touched.endTime && errors.endTime ? "#d32f2f" : "#ddd",
                }}
              />
              <ErrorMessage name="endTime" component="span" style={styles.error} />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              style={{
                ...styles.button,
                ...(isSubmitting || !isValid ? styles.disabledButton : {}),
              }}
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? "⏳ Adding..." : "✅ Add Availability"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AvailabilityForm;