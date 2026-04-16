import { Formik, Form, Field } from "formik";
import { createResource } from "../services/api";
import { resourceSchema } from "../utils/validationSchemas";
import FormError from "./FormError";

function ResourceForm({ refresh }) {
  const initialValues = {
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "ACTIVE",
  };

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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={resourceSchema}
      onSubmit={handleSubmit}
      validateOnBlur={true}
      validateOnChange={true}
    >
      {({ isSubmitting, isValid }) => (
        <Form style={formStyle}>
          <h3 style={headerStyle}>Add Resource</h3>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Resource Name</label>
            <Field 
              name="name" 
              placeholder="e.g., Main Computer Lab" 
              style={fieldStyle}
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            <FormError name="name" />
          </div>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Resource Type</label>
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
            <label style={labelStyle}>Capacity</label>
            <Field 
              name="capacity" 
              type="number" 
              min="0" 
              placeholder="Number of people" 
              style={fieldStyle}
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
            <FormError name="capacity" />
          </div>

          <div style={fieldWrapperStyle}>
            <label style={labelStyle}>Location</label>
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