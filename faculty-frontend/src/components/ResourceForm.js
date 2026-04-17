import { Formik, Form, Field } from "formik";
import { createResource } from "../services/api";
import { resourceSchema } from "../utils/validationSchemas";
import FormError from "./FormError";
import * as Yup from "yup";

function ResourceForm({ refresh }) {
  const initialValues = {
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "ACTIVE",
  };

  // ✅ Extended validation schema with conditional capacity for EQUIPMENT
  const extendedValidationSchema = resourceSchema.concat(
    Yup.object({
      name: Yup.string()
        .required("Resource name is required")
        .max(50, "Resource name cannot exceed 50 characters")
        .matches(/^[a-zA-Z0-9\s]+$/, "Resource name can only contain letters, numbers, and spaces"),
      
      capacity: Yup.number()
        .required("Capacity is required")
        .typeError("Capacity must be a number")
        .min(0, "Capacity cannot be negative")
        .integer("Capacity must be a whole number")
        .test(
          'equipment-capacity-limit',
          'Equipment can only have capacity up to 10',
          function(value) {
            const { type } = this.parent;
            // If type is EQUIPMENT, capacity must be <= 10
            if (type === 'EQUIPMENT') {
              return value <= 10;
            }
            // For other types, capacity must be <= 1000
            return value <= 1000;
          }
        ),
    })
  );

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        ...values,
        name: values.name.trim(),
        capacity: Number(values.capacity),
      };

      await createResource(payload);
      alert("Resource Added!");
      resetForm();
      if (refresh) refresh();
    } catch (error) {
      alert(error?.response?.data || "Error adding resource");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 STYLES
  const formStyle = {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "30px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const headerStyle = {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1a1a2e",
    margin: "0 0 8px 0",
    textAlign: "center",
    borderBottom: "3px solid #4361ee",
    paddingBottom: "12px",
    display: "inline-block",
    width: "fit-content",
    alignSelf: "center",
  };

  const fieldStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...fieldStyle,
    backgroundColor: "#fff",
    cursor: "pointer",
  };

  const buttonStyle = {
    backgroundColor: "#4361ee",
    color: "white",
    border: "none",
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    fontFamily: "inherit",
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    backgroundColor: "#cccccc",
    cursor: "not-allowed",
    opacity: 0.7,
  };

  const fieldWrapperStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "500",
    color: "#4a5568",
    letterSpacing: "0.3px",
  };

  // ✅ Helper to prevent non-numeric input for capacity
  const handleCapacityKeyDown = (e) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right
    if (e.key === "Backspace" || e.key === "Delete" || e.key === "Tab" || 
        e.key === "Escape" || e.key === "Enter" || e.key === "Home" || 
        e.key === "End" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      return;
    }
    // Allow numbers only
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={extendedValidationSchema}
      onSubmit={handleSubmit}
      validateOnBlur={true}
      validateOnChange={true}
    >
      {({ isSubmitting, isValid, errors, touched, values }) => (
        <Form style={formStyle}>
          <h3 style={headerStyle}>Add Resource</h3>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Resource Name *</label>
            <Field 
              name="name" 
              placeholder="e.g., Main Computer Lab (max 50 chars)" 
              style={{
                ...fieldStyle,
                borderColor: touched.name && errors.name ? "#dc3545" : fieldStyle.borderColor
              }}
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            <FormError name="name" />
            <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
              Only letters, numbers, and spaces. Max 50 characters
            </div>
          </div>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Resource Type *</label>
            <Field 
              as="select" 
              name="type"
              style={selectStyle}
            >
              <option value="">Select Type</option>
              <option value="COMPUTER_LAB">Computer Lab</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </Field>
            <FormError name="type" />
          </div>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Capacity *</label>
            <Field 
              name="capacity" 
              type="number" 
              min="0" 
              placeholder="Number of people" 
              style={{
                ...fieldStyle,
                borderColor: touched.capacity && errors.capacity ? "#dc3545" : fieldStyle.borderColor
              }}
              onKeyDown={handleCapacityKeyDown}
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            <FormError name="capacity" />
            <div style={{ 
              fontSize: "11px", 
              color: values.type === "EQUIPMENT" ? "#f59e0b" : "#666", 
              marginTop: "2px",
              fontWeight: values.type === "EQUIPMENT" ? "500" : "normal"
            }}>
              {values.type === "EQUIPMENT" 
                ? "⚠️ Equipment can only have capacity up to 10" 
                : "Maximum capacity: 1000 people"}
            </div>
          </div>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Location *</label>
            <Field 
              as="select" 
              name="location"
              style={selectStyle}
            >
              <option value="">Select Building</option>
              <option value="Building A">Building A</option>
              <option value="Building B">Building B</option>
              <option value="Building C">Building C</option>
              <option value="Building D">Building D</option>
              <option value="Building E">Building E</option>
              <option value="Building F">Building F</option>
            </Field>
            <FormError name="location" />
          </div>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Status</label>
            <Field 
              as="select" 
              name="status"
              style={selectStyle}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </Field>
            <FormError name="status" />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !isValid}
            style={isSubmitting || !isValid ? buttonDisabledStyle : buttonStyle}
            onMouseEnter={(e) => {
              if (!(isSubmitting || !isValid)) {
                e.target.style.backgroundColor = "#2b3cb0";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!(isSubmitting || !isValid)) {
                e.target.style.backgroundColor = "#4361ee";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {isSubmitting ? "Adding..." : "Add Resource"}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default ResourceForm;