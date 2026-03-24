import { useState } from "react";
import ResourceForm from "./components/ResourceForm";
import ResourceList from "./components/ResourceList";

function App() {
  const [reload, setReload] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // 🔄 Refresh list + close popup + scroll
  const refresh = () => {
    setReload((prev) => !prev); // better toggle
    setShowForm(false);

    // scroll to resource list
    setTimeout(() => {
      const list = document.getElementById("resource-list");
      if (list) {
        list.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // 🎨 Overlay style
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

  // 🎨 Modal style
  const modalStyle = {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Faculty Resource Management</h1>

      {/* ➕ ADD BUTTON */}
      <button onClick={() => setShowForm(true)}>
        + Add Resource
      </button>

      {/* 📋 RESOURCE LIST */}
      <ResourceList reload={reload} />

      {/* 🪟 POPUP MODAL */}
      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            {/* ❌ CLOSE BUTTON */}
            <div style={{ textAlign: "right" }}>
              <button onClick={() => setShowForm(false)}>❌</button>
            </div>

            {/* FORM */}
            <ResourceForm refresh={refresh} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;