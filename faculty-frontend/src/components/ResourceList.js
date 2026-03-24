import { useEffect, useState } from "react";
import {
  getAllResources,
  deleteResource,
  updateResource,
  searchResources,
  getAvailabilityByResource,
} from "../services/api";

function ResourceList({ reload, onBook, onAddAvailability }) {
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);

  const [availabilityMap, setAvailabilityMap] = useState({});

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

  // LOAD DATA
  const loadData = () => {
    getAllResources().then((res) => {
      setResources(res.data);
      setAllResources(res.data);
    });
  };

  useEffect(() => {
    loadData();
  }, [reload]);

  // LOAD AVAILABILITY
  useEffect(() => {
    resources.forEach((r) => {
      getAvailabilityByResource(r.id)
        .then((res) => {
          setAvailabilityMap((prev) => ({
            ...prev,
            [r.id]: res.data,
          }));
        })
        .catch(() => {});
    });
  }, [resources]);

  // DELETE
  const handleDelete = (id) => {
    deleteResource(id).then(() => {
      alert("Deleted!");
      loadData();
    });
  };

  // EDIT
  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setEditForm(resource);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // UPDATE
  const handleUpdate = () => {
    updateResource(editingId, editForm).then(() => {
      alert("Updated!");
      setEditingId(null);
      loadData();
    });
  };

  // FILTER
  const handleFilter = () => {
    if (!filter.type && !filter.location) {
      loadData();
      return;
    }

    const filtered = allResources.filter((r) => {
      const typeMatch = filter.type ? r.type === filter.type : true;
      const locationMatch = filter.location
        ? r.location === filter.location
        : true;

      return typeMatch && locationMatch;
    });

    setResources(filtered);
  };

  const uniqueLocations = [
    ...new Set(allResources.map((r) => r.location)),
  ];

  return (
    <div id="resource-list" style={{ padding: "20px" }}>
      <h2>Resources</h2>

      {/* FILTER */}
      <div style={{ marginBottom: "20px" }}>
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

      {/* CARDS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {resources.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "260px",
              backgroundColor:
                r.status === "OUT_OF_SERVICE" ? "#eee" : "#f9f9f9",
              opacity: r.status === "OUT_OF_SERVICE" ? 0.7 : 1,
            }}
          >
            {editingId === r.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input name="name" value={editForm.name} onChange={handleChange} />

                <select name="type" value={editForm.type} onChange={handleChange}>
                  <option value="COMPUTER_LAB">Computer Lab</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>

                <input
                  name="capacity"
                  type="number"
                  value={editForm.capacity}
                  onChange={handleChange}
                />

                <input
                  name="location"
                  value={editForm.location}
                  onChange={handleChange}
                />

                <select name="status" value={editForm.status} onChange={handleChange}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                </select>

                <div>
                  <button onClick={handleUpdate}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h3>{r.name}</h3>
                <p><b>Type:</b> {r.type}</p>
                <p><b>Capacity:</b> {r.capacity}</p>
                <p><b>Location:</b> {r.location}</p>

                <p>
                  <b>Status:</b>{" "}
                  <span style={{ color: r.status === "ACTIVE" ? "green" : "red" }}>
                    {r.status}
                  </span>
                </p>

                {/* AVAILABILITY */}
                <div style={{ marginTop: "10px" }}>
                  <b>Availability:</b>

                  {availabilityMap[r.id]?.length > 0 ? (
                    availabilityMap[r.id].map((a, i) => (
                      <div key={i} style={{ fontSize: "12px" }}>
                        {a.date.split("T")[0]}: {a.startTime} - {a.endTime}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: "12px", color: "gray" }}>
                      No availability
                    </p>
                  )}
                </div>

                <button onClick={() => handleEdit(r)}>Edit</button>
                <button onClick={() => handleDelete(r.id)}>Delete</button>

                {/* ✅ ONLY SHOW IF ACTIVE */}
                {r.status === "ACTIVE" && (
                  <>
                    <button
                      onClick={() => onBook(r)}
                      style={{
                        marginLeft: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                      }}
                    >
                      Book
                    </button>

                    <button
                      onClick={() => onAddAvailability(r)}
                      style={{
                        marginLeft: "10px",
                        backgroundColor: "green",
                        color: "white",
                      }}
                    >
                      Add Availability
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourceList;