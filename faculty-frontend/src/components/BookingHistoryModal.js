import { useEffect, useState } from "react";
import { getBookingsByUser } from "../services/api";

function BookingHistoryModal({ resources, onClose }) {
  const [myBookings, setMyBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadMyBookings();
  }, []);

  // ✅ LOAD USER BOOKINGS (HISTORY)
  const loadMyBookings = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    try {
      const res = await getBookingsByUser(user.id);
      setMyBookings(res.data);
    } catch (err) {
      console.error("Error loading bookings", err);
    }
  };

  // ✅ FORMAT DATE
  const formatDate = (date) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  // ✅ FILTER BY DATE
  const filteredBookings = selectedDate
    ? myBookings.filter(
        (b) => formatDate(b.date) === selectedDate
      )
    : myBookings;

  // ✅ SORT BY DATE DESCENDING (NEWEST FIRST)
  const sortedBookings = filteredBookings.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 🎨 Modern UI Styles
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const modalStyle = {
    backgroundColor: "#fff",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
  };

  const modalHeaderStyle = {
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const modalTitleStyle = {
    color: "white",
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const closeButtonStyle = {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const modalContentStyle = {
    padding: "24px",
    maxHeight: "calc(85vh - 80px)",
    overflowY: "auto",
  };

  const filterSectionStyle = {
    marginBottom: "24px",
  };

  const filterLabelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "8px",
  };

  const filterInputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    fontFamily: "inherit",
  };

  const statsBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "12px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "12px",
  };

  const statsItemStyle = {
    textAlign: "center",
  };

  const statsLabelStyle = {
    fontSize: "11px",
    color: "#666",
    marginBottom: "4px",
  };

  const statsValueStyle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a2e",
  };

  const emptyStateStyle = {
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
  };

  const emptyStateIconStyle = {
    fontSize: "48px",
    marginBottom: "16px",
  };

  const historyCardStyle = {
    background: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    position: "relative",
    overflow: "hidden",
  };

  const historyCardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "2px solid #f0f0f0",
  };

  const bookingIdStyle = {
    fontSize: "11px",
    color: "#666",
    fontWeight: "500",
    background: "#f0f0f0",
    padding: "2px 8px",
    borderRadius: "12px",
    display: "inline-block",
  };

  const resourceNameStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "4px",
  };

  const dateBadgeStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  };

  const bookingDetailGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "8px",
  };

  const detailItemStyle = {
    fontSize: "13px",
  };

  const detailLabelStyle = {
    fontWeight: "600",
    color: "#4a5568",
    marginRight: "6px",
  };

  const detailValueStyle = {
    color: "#1a1a2e",
  };

  const timeSlotStyle = {
    display: "inline-block",
    background: "#e3f2fd",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#1976d2",
  };

  const statusBadgeStyle = (status) => {
    const isPast = new Date(status) < new Date();
    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "600",
      backgroundColor: isPast ? "#d4edda" : "#fff3cd",
      color: isPast ? "#155724" : "#856404",
    };
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={modalTitleStyle}>
            <span>📚</span> Booking History
          </h3>
          <button 
            onClick={onClose} 
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
          {/* 📅 DATE FILTER */}
          <div style={filterSectionStyle}>
            <label style={filterLabelStyle}>Filter by Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={filterInputStyle}
              onFocus={(e) => e.target.style.borderColor = "#43e97b"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          {/* 📊 Stats Bar */}
          <div style={statsBarStyle}>
            <div style={statsItemStyle}>
              <div style={statsLabelStyle}>Total Bookings</div>
              <div style={statsValueStyle}>{sortedBookings.length}</div>
            </div>
            <div style={statsItemStyle}>
              <div style={statsLabelStyle}>Unique Resources</div>
              <div style={statsValueStyle}>
                {new Set(sortedBookings.map(b => b.resourceId)).size}
              </div>
            </div>
            <div style={statsItemStyle}>
              <div style={statsLabelStyle}>Total Hours</div>
              <div style={statsValueStyle}>
                {sortedBookings.reduce((total, b) => {
                  const start = parseInt(b.startTime.split(':')[0]);
                  const end = parseInt(b.endTime.split(':')[0]);
                  return total + (end - start);
                }, 0)}h
              </div>
            </div>
          </div>

          {/* 📋 LIST */}
          {sortedBookings.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyStateIconStyle}>📭</div>
              <p style={{ margin: 0, fontSize: "14px" }}>No booking history found</p>
              {selectedDate && (
                <p style={{ fontSize: "12px", color: "#bbb", marginTop: "8px" }}>
                  No bookings on the selected date
                </p>
              )}
            </div>
          ) : (
            sortedBookings.map((b, i) => {
              const resource = resources.find(
                (r) => r.id === b.resourceId
              );
              const isPast = new Date(b.date) < new Date();
              const today = new Date().toISOString().split('T')[0];
              const isToday = formatDate(b.date) === today;

              return (
                <div 
                  key={i} 
                  style={historyCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                >
                  <div style={historyCardHeaderStyle}>
                    <div>
                      <div style={bookingIdStyle}>Booking #{b.id}</div>
                      <div style={resourceNameStyle}>{resource?.name || b.resourceId}</div>
                    </div>
                    <div style={dateBadgeStyle}>
                      {isToday ? "Today" : formatDate(b.date)}
                    </div>
                  </div>

                  <div style={bookingDetailGridStyle}>
                    <div style={detailItemStyle}>
                      <span style={detailLabelStyle}>📅 Date:</span>
                      <span style={detailValueStyle}>{formatDate(b.date)}</span>
                    </div>
                    <div style={detailItemStyle}>
                      <span style={detailLabelStyle}>⏰ Time:</span>
                      <span style={timeSlotStyle}>{b.startTime} - {b.endTime}</span>
                    </div>
                    <div style={detailItemStyle}>
                      <span style={detailLabelStyle}>👤 Booked By:</span>
                      <span style={detailValueStyle}>{b.bookedBy}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={statusBadgeStyle(b.date)}>
                      {isPast ? "✓ Completed" : "⏳ Upcoming"}
                    </span>
                    {isToday && (
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor: "#fff3e0",
                        color: "#e65100",
                      }}>
                        🔴 Today
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingHistoryModal;