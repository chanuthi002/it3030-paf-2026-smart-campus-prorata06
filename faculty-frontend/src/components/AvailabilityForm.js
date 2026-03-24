import { useState, useEffect } from "react";
import { createAvailability } from "../services/api";

function AvailabilityForm({ resource, refresh }) {
  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // ✅ AUTO SET RESOURCE
  useEffect(() => {
    if (resource) {
      setForm((prev) => ({
        ...prev,
        resourceId: resource.id,
      }));
    }
  }, [resource]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createAvailability(form)
      .then(() => {
        alert("Availability Added!");
        if (refresh) refresh();
      })
      .catch((err) => {
        alert(err.response?.data || "Error adding availability");
      });
  };

  return (
    <div>
      <h3>Add Availability: {resource?.name}</h3>

      <form style={{ display: "flex", flexDirection: "column", gap: "10px" }} onSubmit={handleSubmit}>
        
        <input value={form.resourceId} disabled />

        <input type="date" name="date" onChange={handleChange} required />

        <input type="time" name="startTime" onChange={handleChange} required />

        <input type="time" name="endTime" onChange={handleChange} required />

        <button type="submit">Add Availability</button>
      </form>
    </div>
  );
}

export default AvailabilityForm;