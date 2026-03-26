import { useState, useEffect } from "react";
import {
  createBooking,
  getAvailabilityByResource,
  getBookingsByDate,
} from "../services/api";

function BookingForm({ resource, refresh }) {
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
    if (form.date && resource) {
      getBookingsByDate(form.date).then((res) => {
        // filter only this resource
        const filtered = res.data.filter(
          (b) => b.resourceId === resource.id
        );
        setBookings(filtered);
      });
    }
  }, [form.date, resource]);

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  // ✅ SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();

    createBooking(form)
      .then(() => {
        alert("✅ Booking Successful!");
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

      {/* 📅 DATE */}
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        required
      />

      {/* ===================== */}
      {/* 🔴 BOOKED TIME */}
      {/* ===================== */}
      <div style={{ marginTop: "15px" }}>
        <b>Booked Time:</b>

        {!form.date && <p>Select a date</p>}

        {form.date && filteredBookings.length === 0 && (
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

        {form.date && remainingSlots.length === 0 && (
          <p style={{ color: "red" }}>No available time</p>
        )}

        {remainingSlots.map((slot, i) => (
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

        <button type="submit">Confirm Booking</button>
      </form>
    </div>
  );
}

export default BookingForm;