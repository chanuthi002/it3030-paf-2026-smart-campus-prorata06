import { useEffect, useState } from "react";
import {
  getAllResources,
  deleteResource,
  updateResource,
  searchResources,
} from "../services/api";

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]); // ✅ store original data

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    status: "ACTIVE",
  });

  const [filter, setFilter] = useState({
    type: "",
    location: "",
  });

  // ✅ LOAD DATA
  const loadData = () => {
    getAllResources().then((res) => {
      setResources(res.data);
      setAllResources(res.data);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ DELETE
  const handleDelete = (id) => {
    deleteResource(id).then(() => {
      alert("Deleted!");
      loadData();
    });
  };

  // ✅ EDIT
  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setEditForm(resource);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // ✅ UPDATE
  const handleUpdate = () => {
    updateResource(editingId, editForm).then(() => {
      alert("Updated!");
      setEditingId(null);
      loadData();
    });
  };

  // ✅ FILTER LOGIC (SMART)
  const handleFilter = () => {
    if (!filter.type && !filter.location) {
      loadData();
      return;
    }

    if (filter.type && !filter.location) {
      const filtered = allResources.filter(
        (r) => r.type === filter.type
      );
      setResources(filtered);
      return;
    }

    if (!filter.type && filter.location) {
      const filtered = allResources.filter(
        (r) => r.location === filter.location
      );
      setResources(filtered);
      return;
    }

    searchResources(filter.type, filter.location).then((res) =>
      setResources(res.data)
    );
  };

  // ✅ UNIQUE LOCATIONS (FROM ORIGINAL DATA)
  const uniqueLocations = [
    ...new Set(allResources.map((r) => r.location)),
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resources</h2>

      {/* 🔍 FILTER UI */}
      <div style={{ marginBottom: "20px" }}>
        {/* TYPE */}
        <select
          value={filter.type}
          onChange={(e) =>
            setFilter({ ...filter, type: e.target.value })
          }
        >
          <option value="">Select Type</option>
          <option value="COMPUTER_LAB">Computer Lab</option>
          <option value="LECTURE_HALL">Lecture Hall</option>
          <option value="MEETING_ROOM">Meeting Room</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>

        {/* LOCATION */}
        <select
          value={filter.location}
          style={{ marginLeft: "10px" }}
          onChange={(e) =>
            setFilter({ ...filter, location: e.target.value })
          }
        >
          <option value="">Select Location</option>
          {uniqueLocations.map((loc, index) => (
            <option key={index} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <button onClick={handleFilter} style={{ marginLeft: "10px" }}>
          Search
        </button>

        <button
          onClick={() => {
            setFilter({ type: "", location: "" });
            loadData();
          }}
          style={{ marginLeft: "10px" }}
        >
          Reset
        </button>
      </div>

      {/* 📋 CARDS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {resources.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "250px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {editingId === r.id ? (
              <>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleChange}
                />
                <input
                  name="type"
                  value={editForm.type}
                  onChange={handleChange}
                />
                <input
                  name="capacity"
                  value={editForm.capacity}
                  onChange={handleChange}
                />
                <input
                  name="location"
                  value={editForm.location}
                  onChange={handleChange}
                />

                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleChange}
                >
                  <option>ACTIVE</option>
                  <option>OUT_OF_SERVICE</option>
                </select>

                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3>{r.name}</h3>
                <p><b>Type:</b> {r.type}</p>
                <p><b>Capacity:</b> {r.capacity}</p>
                <p><b>Location:</b> {r.location}</p>
                <p>
                  <b>Status:</b>{" "}
                  <span
                    style={{
                      color:
                        r.status === "ACTIVE" ? "green" : "red",
                    }}
                  >
                    {r.status}
                  </span>
                </p>

                <button onClick={() => handleEdit(r)}>Edit</button>
                <button onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourceList;