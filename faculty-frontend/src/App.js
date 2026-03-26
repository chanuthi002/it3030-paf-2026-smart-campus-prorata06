import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ResourceForm from "./components/ResourceForm";
import ResourceList from "./components/ResourceList";
import BookingForm from "./components/BookingForm";
import AvailabilityForm from "./components/AvailabilityForm";
import Login from "./components/Login";


// 🔐 PROTECTED ROUTE (FIXED)
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");

    const params = new URLSearchParams(window.location.search);
    const hasOAuthData = params.get("email");

    if (user || hasOAuthData) {
      setIsAuth(true);
    }

    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

  return isAuth ? children : <Navigate to="/" />;
};


// 🎯 DASHBOARD
const Dashboard = () => {

  const [reload, setReload] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  const [user, setUser] = useState(null);

  // ✅ HANDLE OAUTH USER (FIXED)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const email = params.get("email");
    const name = params.get("name");
    const role = params.get("role");
    const id = params.get("id");

    if (email) {
      const userData = {
        email: decodeURIComponent(email),
        name: decodeURIComponent(name),
        role: decodeURIComponent(role),
        id: decodeURIComponent(id),
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // ✅ clean URL
      window.history.replaceState({}, document.title, "/dashboard");
    } else {
      const stored = JSON.parse(localStorage.getItem("user"));
      setUser(stored);
    }
  }, []);

  // 🔄 REFRESH
  const refresh = () => {
    setReload(prev => !prev);
    setShowForm(false);
    setShowBooking(false);
    setShowAvailability(false);
  };

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

      {/* 🔐 HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>📊 Faculty Resource Dashboard</h1>

        <div>
          {user && (
            <>
              <span>{user.name} ({user.role})</span>

              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "http://localhost:8080/logout";
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* ➕ ADMIN ONLY */}
      {user?.role === "ADMIN" && (
        <button onClick={() => setShowForm(true)}>+ Add Resource</button>
      )}

      {/* 📋 RESOURCE LIST */}
      <ResourceList
        reload={reload}
        onBook={(resource) => {
          setSelectedResource(resource);
          setShowBooking(true);
        }}
        onAddAvailability={(resource) => {
          setSelectedResource(resource);
          setShowAvailability(true);
        }}
      />

      {/* 🪟 ADD RESOURCE */}
      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowForm(false)}>❌</button>
            <ResourceForm refresh={refresh} />
          </div>
        </div>
      )}

      {/* 🪟 BOOKING */}
      {showBooking && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowBooking(false)}>❌</button>
            <BookingForm resource={selectedResource} refresh={refresh} />
          </div>
        </div>
      )}

      {/* 🪟 AVAILABILITY */}
      {showAvailability && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowAvailability(false)}>❌</button>
            <AvailabilityForm resource={selectedResource} refresh={refresh} />
          </div>
        </div>
      )}
    </div>
  );
};


// 🚀 ROUTING
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;