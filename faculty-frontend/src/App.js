import { useState } from "react";
import ResourceForm from "./components/ResourceForm";
import ResourceList from "./components/ResourceList";
import BookingForm from "./components/BookingForm";
import AvailabilityForm from "./components/AvailabilityForm"; // ✅ NEW

function App() {
  const [reload, setReload] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // 🔥 BOOKING STATE
  const [showBooking, setShowBooking] = useState(false);

  // 🔥 AVAILABILITY STATE (NEW)
  const [showAvailability, setShowAvailability] = useState(false);

  // 🔥 SELECTED RESOURCE
  const [selectedResource, setSelectedResource] = useState(null);

  // 🔄 REFRESH FUNCTION
  const refresh = () => {
    setReload((prev) => !prev);

    setShowForm(false);
    setShowBooking(false);
    setShowAvailability(false); // ✅ close availability popup

    setTimeout(() => {
      const list = document.getElementById("resource-list");
      if (list) list.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // 🎨 STYLES
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Faculty Resource Management</h1>

      {/* ➕ ADD RESOURCE */}
      <button onClick={() => setShowForm(true)}>+ Add Resource</button>

      {/* 📋 RESOURCE LIST */}
      <ResourceList
        reload={reload}

        // ✅ BOOK BUTTON
        onBook={(resource) => {
          setSelectedResource(resource);
          setShowBooking(true);
        }}

        // ✅ ADD AVAILABILITY BUTTON (NEW)
        onAddAvailability={(resource) => {
          setSelectedResource(resource);
          setShowAvailability(true);
        }}
      />

      {/* 🪟 ADD RESOURCE POPUP */}
      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowForm(false)}>❌</button>
            <ResourceForm refresh={refresh} />
          </div>
        </div>
      )}

      {/* 🪟 BOOKING POPUP */}
      {showBooking && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowBooking(false)}>❌</button>

            <BookingForm
              resource={selectedResource}
              refresh={refresh}
            />
          </div>
        </div>
      )}

      {/* 🪟 AVAILABILITY POPUP (NEW) */}
      {showAvailability && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowAvailability(false)}>❌</button>

            <AvailabilityForm
              resource={selectedResource}
              refresh={refresh}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;