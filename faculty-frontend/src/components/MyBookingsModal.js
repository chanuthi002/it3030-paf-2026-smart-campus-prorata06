import { useEffect, useState } from "react";
import { getBookingsByUser } from "../services/api";

function MyBookingsModal({ resources, onClose }) {
  const [myBookings, setMyBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    loadMyBookings();
  }, []);

  // ✅ LOAD USER BOOKINGS (NEW API 🔥)
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

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>📅 Your Bookings</h3>

        <button onClick={onClose}>❌</button>

        {/* 📅 DATE FILTER */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ margin: "10px 0" }}
        />

        {/* 📋 LIST */}
        {filteredBookings.length === 0 ? (
          <p>No bookings found</p>
        ) : (
          filteredBookings.map((b, i) => {
            const resource = resources.find(
              (r) => r.id === b.resourceId
            );

            return (
              <div key={i} style={cardStyle}>
                <p><b>Resource:</b> {resource?.name || b.resourceId}</p>
                <p><b>Date:</b> {formatDate(b.date)}</p>
                <p><b>Time:</b> {b.startTime} - {b.endTime}</p>
                <p><b>Booked By:</b> {b.bookedBy}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

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
  width: "500px",
  maxHeight: "80vh",
  overflowY: "auto",
};

const cardStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  marginTop: "10px",
  borderRadius: "5px",
};

export default MyBookingsModal;