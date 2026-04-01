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
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
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
          <h3>Add Resource</h3>

          <Field name="name" placeholder="Name" />
          <FormError name="name" />

          <Field as="select" name="type">
            <option value="">Select Type</option>
            <option value="COMPUTER_LAB">Computer Lab</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </Field>
          <FormError name="type" />

          <Field name="capacity" type="number" min="0" placeholder="Capacity" />
          <FormError name="capacity" />

          <Field as="select" name="location">
            <option value="">Select Building</option>
            <option value="Building A">Building A</option>
            <option value="Building B">Building B</option>
            <option value="Building C">Building C</option>
            <option value="Building D">Building D</option>
            <option value="Building E">Building E</option>
            <option value="Building F">Building F</option>
          </Field>
          <FormError name="location" />

          <Field as="select" name="status">
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </Field>
          <FormError name="status" />

          <button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? "Adding..." : "Add Resource"}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default ResourceForm;