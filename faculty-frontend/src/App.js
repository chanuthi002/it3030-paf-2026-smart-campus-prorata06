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

  // 🎨 MODERN BUTTON STYLES
  const buttonBaseStyle = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const addResourceButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
    color: "white",
  };

  const reportIncidentButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #ff9800 0%, #e65100 100%)",
    color: "white",
  };

  const incidentDashboardButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
    color: "white",
  };

  const adminBookingButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #e83e8c 0%, #c9184a 100%)",
    color: "white",
  };

  const resourceAdminButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #0f766e 0%, #0d5c5c 100%)",
    color: "white",
  };

  const incidentAdminButtonStyle = {
    ...buttonBaseStyle,
    background: "linear-gradient(135deg, #7c2d12 0%, #5a1e0c 100%)",
    color: "white",
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "#fff",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "85vh",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
  };

  const modalHeaderStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "flex-end",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const closeButtonStyle = {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const modalContentStyle = {
    padding: "20px",
    maxHeight: "calc(85vh - 70px)",
    overflowY: "auto",
  };

  const adminPopupStyle = {
    backgroundColor: "#fff",
    width: "95%",
    maxWidth: "1200px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "16px",
    padding: "20px",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const adminCloseButtonStyle = {
    position: "absolute",
    top: "16px",
    right: "16px",
    border: "none",
    backgroundColor: "#efefef",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s ease",
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>

      {/* 🎨 MODERN HEADER */}
      <div style={{ 
        marginBottom: "24px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      }}>
        {/* Gradient Top Bar */}
        <div style={{
          height: "4px",
          background: "linear-gradient(90deg, #007bff, #00f2fe, #43e97b, #fa709a, #667eea)",
          backgroundSize: "200% 100%",
          animation: "gradientMove 3s ease infinite",
        }}></div>
        
        {/* Main Header Content */}
        <div style={{ 
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}>
          {/* Logo and Title Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}>
              🏫
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: "28px", 
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                CBH Campus
              </h1>
              <p style={{ 
                margin: "4px 0 0", 
                fontSize: "14px", 
                color: "#a0aec0",
                fontWeight: "500"
              }}>
                Faculty Resource Management System
              </p>
            </div>
          </div>

          {/* User Info and Logout Section */}
          {user && (
            <div style={{ 
              display: "flex", 
              gap: "16px", 
              alignItems: "center",
              background: "rgba(255,255,255,0.1)",
              padding: "8px 20px",
              borderRadius: "50px",
              backdropFilter: "blur(10px)",
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px",
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}>
                  👤
                </div>
                <div>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "white"
                  }}>
                    {user.name}
                  </div>
                  <div style={{ 
                    fontSize: "11px", 
                    color: "#a0aec0",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "2px"
                  }}>
                    <span style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: user.role === "ADMIN" ? "#22c55e" : user.role === "STAFF" ? "#3b82f6" : "#f59e0b",
                    }}></span>
                    {user.role}
                  </div>
                </div>
              </div>
              
              <button
                style={{
                  padding: "8px 20px",
                  background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "40px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(220, 53, 69, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.href = "http://localhost:8080/logout";
                }}
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
        
        {/* Stats Bar */}
        <div style={{
          background: "white",
          padding: "12px 32px",
          display: "flex",
          gap: "24px",
          borderTop: "1px solid #e0e0e0",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📊</span>
            <div>
              <div style={{ fontSize: "11px", color: "#666", fontWeight: "500" }}>Dashboard</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>Resource Overview</div>
            </div>
          </div>
          <div style={{ width: "1px", backgroundColor: "#e0e0e0" }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🎯</span>
            <div>
              <div style={{ fontSize: "11px", color: "#666", fontWeight: "500" }}>Role</div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>{user?.role || "Loading..."}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔧 QUICK ACTIONS - NEW LAYOUT */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "24px", 
        flexWrap: "wrap",
        gap: "12px"
      }}>
        {/* LEFT SIDE BUTTONS */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* ADMIN ONLY - ADD RESOURCE */}
          {user?.role === "ADMIN" && (
            <button 
              onClick={() => setShowForm(true)}
              style={addResourceButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 123, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              ➕ Add Resource
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
              style={resourceAdminButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(15, 118, 110, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              🧭 Resource Admin Dashboard
            </button>
          )}
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* ADMIN & STAFF & USER - REPORT INCIDENT */}
          {(user?.role === "ADMIN" || user?.role === "USER") && (
            <button 
              onClick={() => setShowReportIncident(true)}
              style={reportIncidentButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(255, 152, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              🚨 Report Incident
            </button>
          )}

          {/* ADMIN & STAFF ONLY - INCIDENT DASHBOARD */}
          {(user?.role === "STAFF" || user?.role === "ADMIN") && (
            <button 
              onClick={() => setShowIncidentDashboard(true)}
              style={incidentDashboardButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(34, 197, 94, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              🔧 Incident Dashboard
            </button>
          )}

          {/* ADMIN ONLY - BOOKING DASHBOARD */}
          {user?.role === "ADMIN" && (
            <button 
              onClick={() => setShowAdminDashboard(true)}
              style={adminBookingButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(232, 62, 140, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              📊 Admin Booking Dashboard
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
              style={incidentAdminButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(124, 45, 18, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              🛠️ Incident Admin Dashboard
            </button>
          )}
        </div>
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
              style={{
                marginBottom: "15px",
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5a6268";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6c757d";
              }}
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
            style={{
              marginBottom: "15px",
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a6268";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6c757d";
            }}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e0e0e0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#efefef";
              }}
            >
              ✕ Close
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e0e0e0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#efefef";
              }}
            >
              ✕ Close
            </button>
            <IncidentAdminDashboard />
          </div>
        </div>
      )}

      {/* 🪟 ADD RESOURCE */}
      {showForm && (
        <div style={overlayStyle} onClick={() => setShowForm(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <button 
                onClick={() => setShowForm(false)} 
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
                }}
              >
                ✕
              </button>
            </div>
            <div style={modalContentStyle}>
              <ResourceForm refresh={refresh} />
            </div>
          </div>
        </div>
      )}

      {/* 🪟 BOOKING */}
      {showBooking && (
        <div style={overlayStyle} onClick={() => setShowBooking(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <button 
                onClick={() => setShowBooking(false)} 
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
                }}
              >
                ✕
              </button>
            </div>
            <div style={modalContentStyle}>
              <BookingForm resource={selectedResource} refresh={refresh} />
            </div>
          </div>
        </div>
      )}

      {/* 🪟 AVAILABILITY */}
      {showAvailability && (
        <div style={overlayStyle} onClick={() => setShowAvailability(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <button 
                onClick={() => setShowAvailability(false)} 
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
                }}
              >
                ✕
              </button>
            </div>
            <div style={modalContentStyle}>
              <AvailabilityForm resource={selectedResource} refresh={refresh} />
            </div>
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