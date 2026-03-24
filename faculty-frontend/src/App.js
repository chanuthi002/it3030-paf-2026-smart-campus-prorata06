import { useState } from "react";
import ResourceForm from "./components/ResourceForm";
import ResourceList from "./components/ResourceList";

function App() {
  const [reload, setReload] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => {
    setReload(!reload);
    setShowForm(false);
  };

  // ✅ ADD THESE STYLES HERE
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

      {/* 🔘 OPEN BUTTON */}
      <button onClick={() => setShowForm(true)}>+ Add Resource</button>

      {/* 📋 LIST */}
      <ResourceList reload={reload} />

      {/* 🪟 POPUP */}
      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowForm(false)}>❌</button>
            <ResourceForm refresh={refresh} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;