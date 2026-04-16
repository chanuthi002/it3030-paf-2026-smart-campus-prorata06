import { useState, useEffect } from "react";
import {
  createBooking,
  getAvailabilityByResource,
  getBookingsByDate,
} from "../services/api";

function BookingForm({ resource, refresh }) {
  const today = new Date();
  const maxDateObj = new Date(today);
  maxDateObj.setMonth(maxDateObj.getMonth() + 1);

  const minDate = today.toISOString().split("T")[0];
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const [form, setForm] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    bookedBy: "",
    userId: "",
  });

  const [availability, setAvailability] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dateError, setDateError] = useState("");

  const validateDateRange = (dateValue) => {
    if (!dateValue) return "";
    if (dateValue < minDate) return "Past dates are not allowed";
    if (dateValue > maxDate) return "You can only book within one month";
    return "";
  };

  // ✅ LOAD RESOURCE + USER
  useEffect(() => {
    if (resource) {
      const user = JSON.parse(localStorage.getItem("user"));

      setForm((prev) => ({
        ...prev,
        resourceId: resource.id,
        bookedBy: user?.name || "",
        userId: user?.id || "",
      }));

      // load availability
      getAvailabilityByResource(resource.id).then((res) =>
        setAvailability(res.data)
      );
    }
  }, [resource]);

  // ✅ LOAD BOOKINGS BY DATE (NEW 🔥)
  useEffect(() => {
    if (form.date && resource && !dateError) {
      getBookingsByDate(form.date).then((res) => {
        // filter only this resource
        const filtered = res.data.filter(
          (b) => b.resourceId === resource.id
        );
        setBookings(filtered);
      });
    } else if (dateError) {
      setBookings([]);
    }
  }, [form.date, resource, dateError]);

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "date") {
      setDateError(validateDateRange(value));
    }
  };

  // ✅ FILTER AVAILABILITY BY DATE
  const filteredAvailability = availability.filter(
    (a) => a.date?.slice(0, 10) === form.date
  );

  // ✅ FILTER BOOKINGS BY DATE
  const filteredBookings = bookings;

  // 🔥 SLOT SPLITTING (REMAINING TIME)
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

  const remainingSlots = subtractBookings(
    filteredAvailability,
    filteredBookings
  );

  // ✅ CLICK SLOT
  const handleSlotClick = (slot) => {
    setForm({
      ...form,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const [lastBookingId, setLastBookingId] = useState("");

  // ✅ SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    const dateValidationError = validateDateRange(form.date);
    if (dateValidationError) {
      setDateError(dateValidationError);
      return;
    }

    createBooking(form)
      .then((res) => {
        const bookingId = res.data?.id || "(unknown)";
        setLastBookingId(bookingId);
        alert(`✅ Booking Successful! ID: ${bookingId}`);
        setForm({
          ...form,
          startTime: "",
          endTime: "",
        });
        if (refresh) refresh();
      })
      .catch((err) => {
        alert(err.response?.data || "Booking failed!");
      });
  };

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>📖 Book Resource</h3>
        <div style={resourceBadgeStyle}>
          <span style={resourceNameStyle}>{resource?.name}</span>
        </div>
      </div>

      {lastBookingId && (
        <div style={successMessageStyle}>
          ✅ Last confirmed Booking ID: <strong>{lastBookingId}</strong>
        </div>
      )}

      {/* Date Selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>📅 Select Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          min={minDate}
          max={maxDate}
          onChange={handleChange}
          required
          style={dateInputStyle}
        />
        {dateError && (
          <p style={errorTextStyle}>
            ⚠️ {dateError}
          </p>
        )}
      </div>

      {/* Two Column Layout for Booked and Available Times */}
      {form.date && !dateError && (
        <div style={twoColumnLayout}>
          {/* Booked Time Section */}
          <div style={columnStyle}>
            <div style={columnHeaderStyle}>
              <span style={columnHeaderIcon}>🔴</span>
              <span style={columnHeaderText}>Booked Time</span>
            </div>
            <div style={slotsContainerStyle}>
              {filteredBookings.length === 0 ? (
                <div style={emptyStateStyle}>
                  <span style={emptyStateIcon}>✅</span>
                  <span>No bookings yet</span>
                </div>
              ) : (
                filteredBookings.map((b, i) => (
                  <div key={i} style={bookedSlotStyle}>
                    <span style={timeIcon}>⏰</span>
                    <span>{b.startTime} - {b.endTime}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Time Section */}
          <div style={columnStyle}>
            <div style={columnHeaderStyle}>
              <span style={columnHeaderIcon}>🟢</span>
              <span style={columnHeaderText}>Available Time Slots</span>
            </div>
            <div style={slotsContainerStyle}>
              {remainingSlots.length === 0 ? (
                <div style={emptyStateStyle}>
                  <span style={emptyStateIcon}>❌</span>
                  <span>No available time</span>
                </div>
              ) : (
                remainingSlots.map((slot, i) => (
                  <div
                    key={i}
                    onClick={() => handleSlotClick(slot)}
                    style={availableSlotStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.backgroundColor = "#c8e6d9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.backgroundColor = "#d4edda";
                    }}
                  >
                    <span style={timeIcon}>🕐</span>
                    <span style={slotTimeStyle}>{slot.startTime} - {slot.endTime}</span>
                    <span style={clickHintStyle}>click to select</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={formFieldStyle}>
          <label style={labelStyle}>🏷️ Resource ID</label>
          <input 
            value={form.resourceId} 
            disabled 
            style={disabledInputStyle}
          />
        </div>

        <div style={formRowStyle}>
          <div style={formFieldHalfStyle}>
            <label style={labelStyle}>⏰ Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              style={timeInputStyle}
              placeholder="Select start time"
            />
          </div>

          <div style={formFieldHalfStyle}>
            <label style={labelStyle}>⏰ End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              style={timeInputStyle}
              placeholder="Select end time"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!!dateError}
          style={!!dateError ? submitButtonDisabledStyle : submitButtonStyle}
          onMouseEnter={(e) => {
            if (!dateError) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(67, 97, 238, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (!dateError) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(67, 97, 238, 0.2)";
            }
          }}
        >
          ✅ Confirm Booking
        </button>
      </form>
    </div>
  );
}

// 🎨 Modern UI Styles
const containerStyle = {
  padding: "0",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const headerStyle = {
  marginBottom: "24px",
  paddingBottom: "16px",
  borderBottom: "2px solid #e0e0e0",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a2e",
  margin: "0 0 12px 0",
};

const resourceBadgeStyle = {
  display: "inline-block",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: "8px 16px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
};

const resourceNameStyle = {
  color: "white",
  fontWeight: "600",
  fontSize: "14px",
};

const successMessageStyle = {
  background: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "20px",
  color: "#1e4620",
  fontWeight: "500",
  fontSize: "13px",
  textAlign: "center",
};

const sectionStyle = {
  marginBottom: "24px",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  fontSize: "13px",
  color: "#4a5568",
  marginBottom: "8px",
  letterSpacing: "0.3px",
};

const dateInputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  border: "2px solid #e0e0e0",
  borderRadius: "10px",
  transition: "all 0.3s ease",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  backgroundColor: "#f8f9fa",
  cursor: "pointer",
};

const errorTextStyle = {
  marginTop: "8px",
  marginBottom: "0",
  color: "#d32f2f",
  fontSize: "12px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const twoColumnLayout = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "24px",
};

const columnStyle = {
  display: "flex",
  flexDirection: "column",
};

const columnHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
  paddingBottom: "8px",
  borderBottom: "2px solid #e0e0e0",
};

const columnHeaderIcon = {
  fontSize: "16px",
};

const columnHeaderText = {
  fontWeight: "600",
  fontSize: "14px",
  color: "#4a5568",
};

const slotsContainerStyle = {
  maxHeight: "300px",
  overflowY: "auto",
  padding: "4px",
};

const bookedSlotStyle = {
  padding: "10px 12px",
  marginBottom: "8px",
  backgroundColor: "#f8d7da",
  borderLeft: "4px solid #dc3545",
  borderRadius: "8px",
  color: "#721c24",
  fontSize: "13px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const availableSlotStyle = {
  padding: "10px 12px",
  marginBottom: "8px",
  backgroundColor: "#d4edda",
  borderLeft: "4px solid #28a745",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  justifyContent: "space-between",
};

const slotTimeStyle = {
  fontWeight: "600",
  color: "#155724",
  fontSize: "13px",
  flex: 1,
};

const clickHintStyle = {
  fontSize: "10px",
  color: "#155724",
  opacity: 0.7,
  fontStyle: "italic",
};

const timeIcon = {
  fontSize: "14px",
};

const emptyStateStyle = {
  padding: "20px",
  textAlign: "center",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  color: "#999",
  fontSize: "13px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
};

const emptyStateIcon = {
  fontSize: "24px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  marginTop: "8px",
  paddingTop: "16px",
  borderTop: "2px solid #e0e0e0",
};

const formFieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const formRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

const formFieldHalfStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const disabledInputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  border: "2px solid #e0e0e0",
  borderRadius: "10px",
  backgroundColor: "#f5f5f5",
  color: "#666",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const timeInputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  border: "2px solid #e0e0e0",
  borderRadius: "10px",
  transition: "all 0.3s ease",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  backgroundColor: "white",
};

const submitButtonStyle = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#4361ee",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  marginTop: "8px",
  fontFamily: "inherit",
  boxShadow: "0 4px 12px rgba(67, 97, 238, 0.2)",
};

const submitButtonDisabledStyle = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#cccccc",
  color: "#666",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "not-allowed",
  marginTop: "8px",
  fontFamily: "inherit",
};

export default BookingForm;