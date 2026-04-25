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

  // ✅ Extended validation schema with conditional capacity for different types
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
          'capacity-limit-by-type',
          function(value) {
            const { type } = this.parent;
            
            // COMPUTER_LAB: max 100
            if (type === 'COMPUTER_LAB') {
              return value <= 100;
            }
            // EQUIPMENT: max 10
            if (type === 'EQUIPMENT') {
              return value <= 10;
            }
            // LECTURE_HALL and MEETING_ROOM: max 1000
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

  // 🎨 ENHANCED STYLES - Smaller header, longer form
  const formStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const formHeaderStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px 24px",
    textAlign: "center",
  };

  const headerIconStyle = {
    fontSize: "32px",
    marginBottom: "6px",
  };

  const headerStyle = {
    fontSize: "20px",
    fontWeight: "600",
    color: "white",
    margin: "0",
    letterSpacing: "-0.3px",
  };

  const headerSubtitleStyle = {
    fontSize: "12px",
    color: "rgba(255,255,255,0.85)",
    marginTop: "4px",
    marginBottom: "0",
  };

  const formContentStyle = {
    padding: "28px 32px 32px 32px",
  };

  const fieldStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
  };

  const selectStyle = {
    ...fieldStyle,
    backgroundColor: "#f8fafc",
    cursor: "pointer",
  };

  const buttonStyle = {
    width: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "12px",
    fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    background: "#cbd5e1",
    cursor: "not-allowed",
    opacity: 0.7,
    boxShadow: "none",
  };

  const fieldWrapperStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "20px",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    letterSpacing: "0.3px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const requiredStarStyle = {
    color: "#ef4444",
    fontSize: "12px",
  };

  const hintTextStyle = {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  // ✅ Helper to prevent non-numeric input for capacity
  const handleCapacityKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete" || e.key === "Tab" || 
        e.key === "Escape" || e.key === "Enter" || e.key === "Home" || 
        e.key === "End" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // ✅ Function to get capacity hint text based on selected type
  const getCapacityHint = (type) => {
    switch(type) {
      case 'COMPUTER_LAB':
        return { text: "⚠️ Computer Lab capacity: Maximum 100 people", color: "#f59e0b", icon: "🖥️" };
      case 'EQUIPMENT':
        return { text: "⚠️ Equipment can only have capacity up to 10", color: "#f59e0b", icon: "🔧" };
      case 'LECTURE_HALL':
        return { text: "📚 Lecture Hall capacity: Maximum 1000 people", color: "#3b82f6", icon: "🏛️" };
      case 'MEETING_ROOM':
        return { text: "👥 Meeting Room capacity: Maximum 1000 people", color: "#3b82f6", icon: "💼" };
      default:
        return { text: "Maximum capacity: 1000 people", color: "#64748b", icon: "📊" };
    }
  };

  // Get icon for resource type
  const getTypeIcon = (type) => {
    switch(type) {
      case 'COMPUTER_LAB': return '💻';
      case 'LECTURE_HALL': return '📖';
      case 'MEETING_ROOM': return '🤝';
      case 'EQUIPMENT': return '🔧';
      default: return '📦';
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
      {({ isSubmitting, isValid, errors, touched, values }) => {
        const capacityHint = getCapacityHint(values.type);
        
        return (
          <Form style={formStyle}>
            {/* Header Section - Made smaller */}
            <div style={formHeaderStyle}>
              <div style={headerIconStyle}>➕</div>
              <h3 style={headerStyle}>Add New Resource</h3>
              <p style={headerSubtitleStyle}>Fill in the details below to create a new resource</p>
            </div>

            {/* Form Content - Made wider */}
            <div style={formContentStyle}>
              {/* Resource Name */}
              <div style={fieldWrapperStyle}>
                <label style={labelStyle}>
                  <span>📝</span> Resource Name
                  <span style={requiredStarStyle}>*</span>
                </label>
                <Field 
                  name="name" 
                  placeholder="e.g., Main Computer Lab" 
                  style={{
                    ...fieldStyle,
                    borderColor: touched.name && errors.name ? "#ef4444" : fieldStyle.borderColor,
                    backgroundColor: touched.name && errors.name ? "#fef2f2" : fieldStyle.backgroundColor
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    if (!errors.name) {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.backgroundColor = "#f8fafc";
                    }
                  }}
                />
                <FormError name="name" />
                <div style={hintTextStyle}>
                  <span>💡</span> Only letters, numbers, and spaces. Max 50 characters
                </div>
              </div>

              {/* Resource Type */}
              <div style={fieldWrapperStyle}>
                <label style={labelStyle}>
                  <span>🏷️</span> Resource Type
                  <span style={requiredStarStyle}>*</span>
                </label>
                <Field 
                  as="select" 
                  name="type"
                  style={{
                    ...selectStyle,
                    borderColor: touched.type && errors.type ? "#ef4444" : selectStyle.borderColor
                  }}
                >
                  <option value="">Select Type</option>
                  <option value="COMPUTER_LAB">💻 Computer Lab</option>
                  <option value="LECTURE_HALL">📖 Lecture Hall</option>
                  <option value="MEETING_ROOM">🤝 Meeting Room</option>
                  <option value="EQUIPMENT">🔧 Equipment</option>
                </Field>
                <FormError name="type" />
                {values.type && (
                  <div style={hintTextStyle}>
                    <span>{getTypeIcon(values.type)}</span> Selected: {values.type.replace('_', ' ')}
                  </div>
                )}
              </div>

              {/* Capacity */}
              <div style={fieldWrapperStyle}>
                <label style={labelStyle}>
                  <span>👥</span> Capacity
                  <span style={requiredStarStyle}>*</span>
                </label>
                <Field 
                  name="capacity" 
                  type="number" 
                  min="0" 
                  placeholder="Number of people" 
                  style={{
                    ...fieldStyle,
                    borderColor: touched.capacity && errors.capacity ? "#ef4444" : fieldStyle.borderColor,
                    backgroundColor: touched.capacity && errors.capacity ? "#fef2f2" : fieldStyle.backgroundColor
                  }}
                  onKeyDown={handleCapacityKeyDown}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.backgroundColor = "#ffffff";
                  }}
                  onBlur={(e) => {
                    if (!errors.capacity) {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.backgroundColor = "#f8fafc";
                    }
                  }}
                />
                <FormError name="capacity" />
                <div style={{ 
                  ...hintTextStyle, 
                  color: capacityHint.color, 
                  fontWeight: values.type === "COMPUTER_LAB" || values.type === "EQUIPMENT" ? "500" : "normal",
                  backgroundColor: values.type === "COMPUTER_LAB" || values.type === "EQUIPMENT" ? "#fef3c7" : "transparent",
                  padding: values.type === "COMPUTER_LAB" || values.type === "EQUIPMENT" ? "6px 10px" : "0",
                  borderRadius: "8px",
                }}>
                  <span>{capacityHint.icon}</span> {capacityHint.text}
                </div>
              </div>

              {/* Location */}
              <div style={fieldWrapperStyle}>
                <label style={labelStyle}>
                  <span>📍</span> Location
                  <span style={requiredStarStyle}>*</span>
                </label>
                <Field 
                  as="select" 
                  name="location"
                  style={{
                    ...selectStyle,
                    borderColor: touched.location && errors.location ? "#ef4444" : selectStyle.borderColor
                  }}
                >
                  <option value="">Select Building</option>
                  <option value="Building A">🏢 Building A</option>
                  <option value="Building B">🏢 Building B</option>
                  <option value="Building C">🏢 Building C</option>
                  <option value="Building D">🏢 Building D</option>
                  <option value="Building E">🏢 Building E</option>
                  <option value="Building F">🏢 Building F</option>
                </Field>
                <FormError name="location" />
              </div>

              {/* Status */}
              <div style={fieldWrapperStyle}>
                <label style={labelStyle}>
                  <span>⚡</span> Status
                </label>
                <Field 
                  as="select" 
                  name="status"
                  style={selectStyle}
                >
                  <option value="ACTIVE">🟢 ACTIVE</option>
                  <option value="OUT_OF_SERVICE">🔴 OUT OF SERVICE</option>
                </Field>
                <FormError name="status" />
                <div style={hintTextStyle}>
                  <span>ℹ️</span> Active resources can be booked by users
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting || !isValid}
                style={isSubmitting || !isValid ? buttonDisabledStyle : buttonStyle}
                onMouseEnter={(e) => {
                  if (!(isSubmitting || !isValid)) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(isSubmitting || !isValid)) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
                  }
                }}
              >
                {isSubmitting ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span>⏳</span> Adding Resource...
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span>✅</span> Add Resource
                  </span>
                )}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

export default ResourceForm;