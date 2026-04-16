import { useEffect, useState } from "react";
import { getBookingsByUser, updateBooking, deleteBooking, getAvailabilityByResource, getBookingsByDate } from "../services/api";

function MyBookingsModal({ resources, onClose }) {
  const [myBookings, setMyBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editData, setEditData] = useState({ date: "", startTime: "", endTime: "" });
  const [editError, setEditError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    setEditingBooking(booking);
    setEditError("");
    setEditData({
      date: formatDate(booking.date),
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
    loadAvailableSlots(booking, formatDate(booking.date));
  };

  const handleEditChange = (field, value) => {
    setEditError("");
    setEditData({ ...editData, [field]: value });

    if (field === "date" && editingBooking) {
      loadAvailableSlots(editingBooking, value);
    }
  };

  const loadAvailableSlots = async (booking, selectedEditDate) => {
    if (!booking || !selectedEditDate) {
      setAvailableSlots([]);
      return;
    }

    const resource = resources.find((r) => r.id === booking.resourceId);
    if (!resource) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);

      const availRes = await getAvailabilityByResource(resource.id);
      const availability = availRes.data.filter(
        (a) => a.date?.slice(0, 10) === selectedEditDate
      );

      const bookRes = await getBookingsByDate(selectedEditDate);
      const allBookings = bookRes.data.filter(
        (b) => b.resourceId === resource.id && b.id !== booking.id
      );

      const remainingSlots = subtractBookings(availability, allBookings);
      setAvailableSlots(remainingSlots);
    } catch (err) {
      console.error("Error loading available slots", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validateEditInput = () => {
    if (!editData.date || !editData.startTime || !editData.endTime) {
      return "Date, start time, and end time are required.";
    }

    if (editData.endTime <= editData.startTime) {
      return "End time must be after start time.";
    }

    return "";
  };

  const getAvailableSlotsText = () => {
    if (loadingSlots) {
      return "Loading...";
    }

    if (availableSlots.length === 0) {
      return "No available slots for this date.";
    }

    return availableSlots
      .map((slot) => `${slot.startTime} - ${slot.endTime}`)
      .join(", ");
  };

  const saveEditBooking = async (booking) => {
    try {
      const inputError = validateEditInput();
      if (inputError) {
        setEditError(inputError);
        return;
      }

      // ✅ VALIDATION: Check availability and conflicts
      const resource = resources.find((r) => r.id === booking.resourceId);
      if (!resource) {
        setEditError("Resource not found.");
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

      if (remainingSlots.length === 0) {
        setEditError("No available time slots for the selected date.");
        return;
      }

      // Check if the new time fits in remaining slots
      const isValid = remainingSlots.some(
        (slot) =>
          slot.startTime <= editData.startTime &&
          slot.endTime >= editData.endTime
      );

      if (!isValid) {
        const slotHint = remainingSlots
          .map((slot) => `${slot.startTime} - ${slot.endTime}`)
          .join(", ");
        setEditError(
          `Invalid time slot. Please choose a time within available slots: ${slotHint}`
        );
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
      setEditError("");
      loadMyBookings();
    } catch (err) {
      console.error("Error updating booking", err);
      setEditError("Unable to update booking: " + (err.response?.data || err.message));
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

  const emptyStateStyle = {
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
  };

  const emptyStateIconStyle = {
    fontSize: "48px",
    marginBottom: "16px",
  };

  const bookingCardStyle = {
    background: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const bookingHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
    paddingBottom: "12px",
    borderBottom: "2px solid #f0f0f0",
  };

  const bookingIdStyle = {
    fontSize: "12px",
    color: "#666",
    fontWeight: "500",
  };

  const resourceNameStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "4px",
  };

  const bookingDetailStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "12px",
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

  const editFormStyle = {
    background: "#f8f9fa",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "12px",
  };

  const editRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "12px",
  };

  const editFieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const editLabelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#4a5568",
  };

  const editInputStyle = {
    padding: "8px 10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "13px",
    transition: "all 0.2s ease",
    outline: "none",
  };

  const slotHintStyle = {
    background: "#e3f2fd",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#1976d2",
    marginTop: "8px",
  };

  const errorTextStyle = {
    marginTop: "8px",
    marginBottom: 0,
    color: "#d32f2f",
    fontSize: "11px",
    fontWeight: 600,
    padding: "6px 10px",
    background: "#ffebee",
    borderRadius: "6px",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  };

  const buttonStyle = (type = "primary") => {
    const styles = {
      primary: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: "#4361ee",
        color: "white",
        transition: "all 0.2s ease",
      },
      secondary: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: "#6c757d",
        color: "white",
        transition: "all 0.2s ease",
      },
      danger: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: "#dc3545",
        color: "white",
        transition: "all 0.2s ease",
      },
      edit: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "600",
        backgroundColor: "#28a745",
        color: "white",
        transition: "all 0.2s ease",
      },
    };
    return styles[type];
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={modalTitleStyle}>
            <span>📅</span> Your Bookings
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
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          {/* 📋 LIST */}
          {filteredBookings.length === 0 ? (
            <div style={emptyStateStyle}>
              <div style={emptyStateIconStyle}>📭</div>
              <p style={{ margin: 0, fontSize: "14px" }}>No bookings found</p>
              {selectedDate && (
                <p style={{ fontSize: "12px", color: "#bbb", marginTop: "8px" }}>
                  No bookings for the selected date
                </p>
              )}
            </div>
          ) : (
            filteredBookings.map((b) => {
              const resource = resources.find(
                (r) => r.id === b.resourceId
              );

              return (
                <div key={b.id} style={bookingCardStyle}>
                  <div style={bookingHeaderStyle}>
                    <div>
                      <div style={bookingIdStyle}>Booking #{b.id}</div>
                      <div style={resourceNameStyle}>{resource?.name || b.resourceId}</div>
                    </div>
                  </div>

                  {editingBookingId === b.id ? (
                    <div style={editFormStyle}>
                      <div style={editRowStyle}>
                        <div style={editFieldStyle}>
                          <label style={editLabelStyle}>Date</label>
                          <input
                            type="date"
                            value={editData.date}
                            onChange={(e) => handleEditChange("date", e.target.value)}
                            style={editInputStyle}
                          />
                        </div>
                        <div style={editFieldStyle}>
                          <label style={editLabelStyle}>Start Time</label>
                          <input
                            type="time"
                            value={editData.startTime}
                            onChange={(e) => handleEditChange("startTime", e.target.value)}
                            style={editInputStyle}
                          />
                        </div>
                        <div style={editFieldStyle}>
                          <label style={editLabelStyle}>End Time</label>
                          <input
                            type="time"
                            value={editData.endTime}
                            onChange={(e) => handleEditChange("endTime", e.target.value)}
                            style={editInputStyle}
                          />
                        </div>
                      </div>

                      <div style={slotHintStyle}>
                        <strong>📅 Available Slots:</strong> {getAvailableSlotsText()}
                      </div>
                      {editError && <p style={errorTextStyle}>⚠️ {editError}</p>}

                      <div style={buttonGroupStyle}>
                        <button 
                          onClick={() => saveEditBooking(b)} 
                          style={buttonStyle("primary")}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.backgroundColor = "#2b3cb0";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.backgroundColor = "#4361ee";
                          }}
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingBookingId(null);
                            setEditingBooking(null);
                            setAvailableSlots([]);
                            setEditError("");
                          }}
                          style={buttonStyle("secondary")}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.backgroundColor = "#5a6268";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.backgroundColor = "#6c757d";
                          }}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={bookingDetailStyle}>
                        <div style={detailItemStyle}>
                          <span style={detailLabelStyle}>📅 Date:</span>
                          <span style={detailValueStyle}>{formatDate(b.date)}</span>
                        </div>
                        <div style={detailItemStyle}>
                          <span style={detailLabelStyle}>⏰ Time:</span>
                          <span style={detailValueStyle}>{b.startTime} - {b.endTime}</span>
                        </div>
                        <div style={detailItemStyle}>
                          <span style={detailLabelStyle}>👤 Booked By:</span>
                          <span style={detailValueStyle}>{b.bookedBy}</span>
                        </div>
                      </div>

                      <div style={buttonGroupStyle}>
                        <button 
                          onClick={() => handleEditClick(b)} 
                          style={buttonStyle("edit")}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.backgroundColor = "#218838";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.backgroundColor = "#28a745";
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => removeBooking(b.id)} 
                          style={buttonStyle("danger")}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.backgroundColor = "#c82333";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.backgroundColor = "#dc3545";
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default MyBookingsModal;