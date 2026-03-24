import { useState } from "react";
import { createResource } from "../services/api";

function ResourceForm({ refresh }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState({});

  // 🔹 HANDLE CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear error when user types
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // 🔹 VALIDATION FUNCTION
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.type) newErrors.type = "Type is required";
    if (!form.capacity || form.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";
    if (!form.location.trim()) newErrors.location = "Location is required";

    return newErrors;
  };

  // 🔹 SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    createResource(form).then(() => {
      alert("Resource Added!");

      if (refresh) refresh();

      setForm({
        name: "",
        type: "",
        capacity: "",
        location: "",
        status: "ACTIVE",
      });

      setErrors({});
    });
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

  const errorStyle = {
    color: "red",
    fontSize: "12px",
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3>Add Resource</h3>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />
      {errors.name && <span style={errorStyle}>{errors.name}</span>}

      {/* 🔽 TYPE DROPDOWN */}
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="">Select Type</option>
        <option value="COMPUTER_LAB">Computer Lab</option>
        <option value="LECTURE_HALL">Lecture Hall</option>
        <option value="MEETING_ROOM">Meeting Room</option>
        <option value="EQUIPMENT">Equipment</option>
      </select>
      {errors.type && <span style={errorStyle}>{errors.type}</span>}

      <input
        name="capacity"
        type="number"
        placeholder="Capacity"
        value={form.capacity}
        onChange={handleChange}
      />
      {errors.capacity && <span style={errorStyle}>{errors.capacity}</span>}

      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
      />
      {errors.location && <span style={errorStyle}>{errors.location}</span>}

      <select name="status" value={form.status} onChange={handleChange}>
        <option value="ACTIVE">ACTIVE</option>
        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
      </select>

      <button type="submit">Add Resource</button>
    </form>
  );
}

export default ResourceForm;