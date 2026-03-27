import { useEffect, useState } from "react";
import { getBookingsByUser, updateBooking, deleteBooking, getAvailabilityByResource, getBookingsByDate } from "../services/api";

function MyBookingsModal({ resources, onClose }) {
  const [myBookings, setMyBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editData, setEditData] = useState({ date: "", startTime: "", endTime: "" });

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

  // 🔥 SLOT SPLITTING (REMAINING TIME) - COPIED FROM BookingForm
  const subtractBookings = (slots, bookings) => {
    let result = [];

    slots.forEach((slot) => {
      let segments = [slot];

      bookings.forEach((b) => {
        let updated = [];

        segments.forEach((seg) => {
          if (
            seg.startTime < b.endTime &&
            seg.endTime > b.startTime
          ) {
            if (seg.startTime < b.startTime) {
              updated.push({ ...seg, endTime: b.startTime });
            }

            if (seg.endTime > b.endTime) {
              updated.push({ ...seg, startTime: b.endTime });
            }
          } else {
            updated.push(seg);
          }
        });

        segments = updated;
      });

      result.push(...segments);
    });

    return result;
  };

  const handleEditClick = (booking) => {
    setEditingBookingId(booking.id);
    setEditData({
      date: formatDate(booking.date),
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const saveEditBooking = async (booking) => {
    try {
      // ✅ VALIDATION: Check availability and conflicts
      const resource = resources.find((r) => r.id === booking.resourceId);
      if (!resource) {
        alert("Resource not found!");
        return;
      }

      // Load availability for the new date
      const availRes = await getAvailabilityByResource(resource.id);
      const availability = availRes.data.filter(
        (a) => a.date?.slice(0, 10) === editData.date
      );

      // Load bookings for the new date
      const bookRes = await getBookingsByDate(editData.date);
      const allBookings = bookRes.data.filter(
        (b) => b.resourceId === resource.id && b.id !== booking.id // exclude current booking
      );

      // Calculate remaining slots
      const remainingSlots = subtractBookings(availability, allBookings);

      // Check if the new time fits in remaining slots
      const isValid = remainingSlots.some(
        (slot) =>
          slot.startTime <= editData.startTime &&
          slot.endTime >= editData.endTime
      );

      if (!isValid) {
        alert("❌ Invalid time slot! No availability or conflicting booking at this time.");
        return;
      }

      // Proceed with update
      await updateBooking(booking.id, {
        ...booking,
        date: editData.date,
        startTime: editData.startTime,
        endTime: editData.endTime,
      });
      setEditingBookingId(null);
      loadMyBookings();
    } catch (err) {
      console.error("Error updating booking", err);
      alert("Unable to update booking: " + (err.response?.data || err.message));
    }
  };

  const removeBooking = async (bookingId) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      await deleteBooking(bookingId);
      loadMyBookings();
    } catch (err) {
      console.error("Error deleting booking", err);
      alert("Unable to delete booking: " + (err.response?.data || err.message));
    }
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
                  <p><b>Booking ID:</b> {b.id}</p>
                  <p><b>Resource:</b> {resource?.name || b.resourceId}</p>
                  {editingBookingId === b.id ? (
                    <>
                      <div style={{ marginTop: "8px" }}>
                        <label style={{ marginRight: "6px" }}>Date:</label>
                        <input
                          type="date"
                          value={editData.date}
                          onChange={(e) => handleEditChange("date", e.target.value)}
                        />
                      </div>
                      <div style={{ marginTop: "8px" }}>
                        <label style={{ marginRight: "6px" }}>Start:</label>
                        <input
                          type="time"
                          value={editData.startTime}
                          onChange={(e) => handleEditChange("startTime", e.target.value)}
                        />
                        <label style={{ margin: "0 6px" }}>End:</label>
                        <input
                          type="time"
                          value={editData.endTime}
                          onChange={(e) => handleEditChange("endTime", e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <p><b>Date:</b> {formatDate(b.date)}</p>
                  )}

                  {editingBookingId === b.id ? (
                    <p><b>Time:</b> {editData.startTime} - {editData.endTime}</p>
                  ) : (
                    <p><b>Time:</b> {b.startTime} - {b.endTime}</p>
                  )}

                  <p><b>Booked By:</b> {b.bookedBy}</p>

                  <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                    {editingBookingId === b.id ? (
                      <>
                        <button onClick={() => saveEditBooking(b)} style={buttonStyle}>Save</button>
                        <button onClick={() => setEditingBookingId(null)} style={buttonStyle}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(b)} style={buttonStyle}>Edit</button>
                        <button onClick={() => removeBooking(b.id)} style={buttonStyle}>Delete</button>
                      </>
                    )}
                  </div>
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

const buttonStyle = {
  padding: "6px 10px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  fontSize: "12px",
};

export default MyBookingsModal;