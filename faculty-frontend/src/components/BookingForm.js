import {
  containerStyle,
  headerStyle,
  titleStyle,
  resourceBadgeStyle,
  resourceNameStyle,
  successMessageStyle,
  sectionStyle,
  labelStyle,
  dateInputStyle,
  errorTextStyle,
  twoColumnLayout,
  columnStyle,
  columnHeaderStyle,
  columnHeaderIcon,
  columnHeaderText,
  slotsContainerStyle,
  bookedSlotStyle,
  availableSlotStyle,
  slotTimeStyle,
  clickHintStyle,
  timeIcon,
  emptyStateStyle,
  emptyStateIcon,
  formStyle,
  formFieldStyle,
  formRowStyle,
  formFieldHalfStyle,
  disabledInputStyle,
  timeInputStyle,
  submitButtonStyle,
  submitButtonDisabledStyle
} from "../styles/bookingFormStyles";

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



export default BookingForm;