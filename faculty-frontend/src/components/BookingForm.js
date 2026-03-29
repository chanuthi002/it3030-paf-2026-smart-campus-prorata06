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
    <div>
      <h3>Book: {resource?.name}</h3>
      {lastBookingId && (
        <p style={{ color: "green", marginBottom: "10px" }}>
          ✅ Last confirmed Booking ID: <strong>{lastBookingId}</strong>
        </p>
      )}

      {/* 📅 DATE */}
      <input
        type="date"
        name="date"
        value={form.date}
        min={minDate}
        max={maxDate}
        onChange={handleChange}
        required
      />
      {dateError && (
        <p style={{ color: "#d32f2f", marginTop: "6px", marginBottom: "0" }}>
          {dateError}
        </p>
      )}

      {/* ===================== */}
      {/* 🔴 BOOKED TIME */}
      {/* ===================== */}
      <div style={{ marginTop: "15px" }}>
        <b>Booked Time:</b>

        {!form.date && <p>Select a date</p>}

        {form.date && !dateError && filteredBookings.length === 0 && (
          <p style={{ color: "gray" }}>No bookings</p>
        )}

        {filteredBookings.map((b, i) => (
          <div
            key={i}
            style={{
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              textDecoration: "line-through",
            }}
          >
            {b.startTime} - {b.endTime}
          </div>
        ))}
      </div>

      {/* ===================== */}
      {/* 🟢 AVAILABLE TIME */}
      {/* ===================== */}
      <div style={{ marginTop: "15px" }}>
        <b>Remaining Available Time:</b>

        {!form.date && <p>Select a date</p>}

        {form.date && !dateError && remainingSlots.length === 0 && (
          <p style={{ color: "red" }}>No available time</p>
        )}

        {!dateError && remainingSlots.map((slot, i) => (
          <div
            key={i}
            onClick={() => handleSlotClick(slot)}
            style={{
              padding: "8px",
              marginTop: "5px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: "#d4edda",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {slot.startTime} - {slot.endTime}
          </div>
        ))}
      </div>

      {/* ===================== */}
      {/* 📋 FORM */}
      {/* ===================== */}
      <form
        onSubmit={handleSubmit}
        style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input value={form.resourceId} disabled />

        <input
          type="time"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={!!dateError}>Confirm Booking</button>
      </form>
    </div>
  );
}

export default BookingForm;