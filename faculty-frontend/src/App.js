import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import ResourceForm from "./components/ResourceForm";
import ResourceList from "./components/ResourceList";
import BookingForm from "./components/BookingForm";
import AvailabilityForm from "./components/AvailabilityForm";
import ReportIncidentForm from "./components/ReportIncidentForm";
import IncidentDashboard from "./components/IncidentDashboard";
import AdminBookingDashboard from "./components/AdminBookingDashboard";
import ResourceAdminDashboard from "./components/ResourceAdminDashboard";
import IncidentAdminDashboard from "./components/IncidentAdminDashboard";
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
  const [showReportIncident, setShowReportIncident] = useState(false);
  const [showIncidentDashboard, setShowIncidentDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showResourceAdminDashboard, setShowResourceAdminDashboard] = useState(false);
  const [showIncidentAdminDashboard, setShowIncidentAdminDashboard] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resources, setResources] = useState([]);

  const [user, setUser] = useState(null);
  const isStaffOnly = user?.role === "STAFF";

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

  // 🔒 STAFF can access only Incident Dashboard
  useEffect(() => {
    if (isStaffOnly) {
      setShowIncidentDashboard(true);
      setShowForm(false);
      setShowBooking(false);
      setShowAvailability(false);
      setShowReportIncident(false);
      setShowAdminDashboard(false);
      setShowResourceAdminDashboard(false);
      setShowIncidentAdminDashboard(false);
    }
  }, [isStaffOnly]);

  // 🔄 REFRESH
  const refresh = () => {
    setReload(prev => !prev);
    setShowForm(false);
    setShowBooking(false);
    setShowAvailability(false);
    setShowReportIncident(false);
    setShowResourceAdminDashboard(false);
    setShowIncidentAdminDashboard(false);
  };

  // 📦 LOAD RESOURCES FOR INCIDENT FORM
  useEffect(() => {
    const loadResources = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/resources");
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Error loading resources:", err);
      }
    };
    loadResources();
  }, []);

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

  const adminPopupStyle = {
    backgroundColor: "#fff",
    width: "95%",
    maxWidth: "1200px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "12px",
    padding: "20px",
    position: "relative",
  };

  const adminCloseButtonStyle = {
    position: "absolute",
    top: "12px",
    right: "12px",
    border: "none",
    backgroundColor: "#efefef",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: "600",
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* 🔐 HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>📊 Faculty Resource Dashboard</h1>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {user && (
            <>
              <span style={{ fontSize: "14px" }}>{user.name} ({user.role})</span>

              <button
                style={{ padding: "8px 16px", backgroundColor: "#f0f0f0" }}
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

      {/* 🔧 QUICK ACTIONS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* ADMIN ONLY - ADD RESOURCE */}
        {user?.role === "ADMIN" && (
          <button 
            onClick={() => setShowForm(true)}
            style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            ➕ Add Resource
          </button>
        )}

        {/* ADMIN & STAFF & USER - REPORT INCIDENT */}
        {(user?.role === "ADMIN" || user?.role === "USER") && (
          <button 
            onClick={() => setShowReportIncident(true)}
            style={{ padding: "10px 20px", backgroundColor: "#ff9800", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            🚨 Report Incident 
          </button>
        )}

        {/* ADMIN & STAFF ONLY - INCIDENT DASHBOARD */}
        {(user?.role === "STAFF" || user?.role === "ADMIN") && (
          <button 
            onClick={() => setShowIncidentDashboard(true)}
            style={{ padding: "10px 20px", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            🔧 Incident Dashboard
          </button>
        )}

        {/* ADMIN ONLY - BOOKING DASHBOARD */}
        {user?.role === "ADMIN" && (
          <button 
            onClick={() => setShowAdminDashboard(true)}
            style={{ padding: "10px 20px", backgroundColor: "#e83e8c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            📊 Admin Booking Dashboard
          </button>
        )}

        {/* ADMIN ONLY - RESOURCE ADMIN DASHBOARD */}
        {user?.role === "ADMIN" && (
          <button
            onClick={() => {
              setShowResourceAdminDashboard(true);
              setShowAdminDashboard(false);
              setShowIncidentDashboard(false);
              setShowIncidentAdminDashboard(false);
            }}
            style={{ padding: "10px 20px", backgroundColor: "#0f766e", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            🧭 Resource Admin Dashboard
          </button>
        )}

        {/* ADMIN ONLY - INCIDENT ADMIN DASHBOARD */}
        {user?.role === "ADMIN" && (
          <button
            onClick={() => {
              setShowIncidentAdminDashboard(true);
              setShowAdminDashboard(false);
              setShowIncidentDashboard(false);
              setShowResourceAdminDashboard(false);
            }}
            style={{ padding: "10px 20px", backgroundColor: "#7c2d12", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            🛠️ Incident Admin Dashboard
          </button>
        )}
      </div>

      {/* 📋 RESOURCE LIST - SHOW FOR ADMIN, STAFF, USER */}
      {!isStaffOnly && !showIncidentDashboard && !showAdminDashboard && !showResourceAdminDashboard && !showIncidentAdminDashboard && (user?.role === "ADMIN" || user?.role === "USER") && (
        <ResourceList
          reload={reload}
          userRole={user?.role}
          onBook={(resource) => {
            setSelectedResource(resource);
            setShowBooking(true);
          }}
          onAddAvailability={(resource) => {
            setSelectedResource(resource);
            setShowAvailability(true);
          }}
        />
      )}

      {/* 🛡️ INCIDENT DASHBOARD (ADMIN & STAFF ONLY) */}
      {showIncidentDashboard && (user?.role === "STAFF" || user?.role === "ADMIN") && (
        <div>
          {!isStaffOnly && (
            <button 
              onClick={() => setShowIncidentDashboard(false)}
              style={{ marginBottom: "15px", padding: "8px 16px", backgroundColor: "#ccc" }}
            >
              ← Back to Resources
            </button>
          )}
          <IncidentDashboard user={user} />
        </div>
      )}

      {/* 📊 ADMIN BOOKING DASHBOARD (ADMIN ONLY) */}
      {showAdminDashboard && user?.role === "ADMIN" && (
        <div>
          <button 
            onClick={() => setShowAdminDashboard(false)}
            style={{ marginBottom: "15px", padding: "8px 16px", backgroundColor: "#ccc" }}
          >
            ← Back to Resources
          </button>
          <AdminBookingDashboard onClose={() => setShowAdminDashboard(false)} />
        </div>
      )}

      {/* 🧭 RESOURCE ADMIN DASHBOARD (ADMIN ONLY) */}
      {showResourceAdminDashboard && user?.role === "ADMIN" && (
        <div style={overlayStyle} onClick={() => setShowResourceAdminDashboard(false)}>
          <div style={adminPopupStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowResourceAdminDashboard(false)}
              style={adminCloseButtonStyle}
            >
              Close
            </button>
            <ResourceAdminDashboard />
          </div>
        </div>
      )}

      {/* 🛠️ INCIDENT ADMIN DASHBOARD (ADMIN ONLY) */}
      {showIncidentAdminDashboard && user?.role === "ADMIN" && (
        <div style={overlayStyle} onClick={() => setShowIncidentAdminDashboard(false)}>
          <div style={adminPopupStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowIncidentAdminDashboard(false)}
              style={adminCloseButtonStyle}
            >
              Close
            </button>
            <IncidentAdminDashboard />
          </div>
        </div>
      )}

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

      {/* 🚨 REPORT INCIDENT */}
      {showReportIncident && (
        <ReportIncidentForm
          resources={resources}
          user={user}
          onClose={() => setShowReportIncident(false)}
          onSuccess={() => {
            setReload(prev => !prev);
          }}
        />
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