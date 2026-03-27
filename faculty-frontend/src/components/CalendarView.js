import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { getBookingsByResource, getIncidentsByResource } from "../services/api";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CalendarView({ resource }) {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // 📅 LOAD BOOKINGS AND INCIDENTS
  useEffect(() => {
    if (resource) {
      const allEvents = [];

      // 📌 LOAD BOOKINGS
      getBookingsByResource(resource.id)
        .then((res) => {
          const bookingEvents = res.data.map((b) => ({
            id: `booking-${b.id}`,
            title: `📅 Booked by ${b.bookedBy}`,
            start: new Date(`${b.date}T${b.startTime}`),
            end: new Date(`${b.date}T${b.endTime}`),
            resource: b,
            type: "BOOKING",
            backgroundColor: "#4285F4",
            color: "white",
          }));

          allEvents.push(...bookingEvents);
          setEvents([...allEvents]);
        })
        .catch(() => {});

      // 🔴 LOAD INCIDENTS
      getIncidentsByResource(resource.id)
        .then((res) => {
          const incidentEvents = res.data.map((incident) => ({
            id: `incident-${incident.id}`,
            title: `🚨 ${incident.title}`,
            start: new Date(incident.createdAt),
            end: new Date(incident.createdAt),
            resource: incident,
            type: "INCIDENT",
            backgroundColor: incident.priority === "CRITICAL" ? "#DC143C" : "#FF6347",
            color: "white",
          }));

          allEvents.push(...incidentEvents);
          setEvents([...allEvents]);
        })
        .catch(() => {});
    }
  }, [resource]);

  // 🎨 CUSTOM EVENT STYLE GETTER
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.backgroundColor || "#1f77b4",
      borderRadius: "5px",
      opacity: 0.9,
      color: event.color || "white",
      border: "0px",
      display: "block",
      fontSize: "12px",
      fontWeight: "500",
      padding: "2px 4px",
    };

    return { style };
  };

  // 📊 HANDLE EVENT CLICK
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const styles = {
    container: {
      marginTop: "20px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "15px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
      paddingBottom: "10px",
      borderBottom: "2px solid #f0f0f0",
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#222",
    },
    controls: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    viewButton: {
      padding: "6px 12px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: "#fff",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
    },
    viewButtonActive: {
      backgroundColor: "#4285F4",
      color: "white",
      border: "1px solid #4285F4",
    },
    calendarContainer: {
      height: "600px",
      marginBottom: "15px",
    },
    legend: {
      display: "flex",
      gap: "20px",
      padding: "10px 0",
      fontSize: "13px",
      borderTop: "1px solid #f0f0f0",
      paddingTop: "15px",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    legendColor: {
      width: "16px",
      height: "16px",
      borderRadius: "3px",
    },
    modal: {
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
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "10px",
      padding: "25px",
      width: "400px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    },
    modalTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "15px",
      color: "#222",
    },
    modalInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginBottom: "20px",
    },
    infoRow: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    infoLabel: {
      fontWeight: "600",
      fontSize: "13px",
      color: "#666",
    },
    infoValue: {
      fontSize: "14px",
      color: "#222",
    },
    closeButton: {
      padding: "8px 16px",
      backgroundColor: "#f0f0f0",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.title}>
          📅 Calendar: {resource?.name || "Select a Resource"}
        </div>

        {/* VIEW CONTROLS */}
        <div style={styles.controls}>
          {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map((v) => (
            <button
              key={v}
              style={{
                ...styles.viewButton,
                ...(view === v ? styles.viewButtonActive : {}),
              }}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* CALENDAR */}
      {resource ? (
        <>
          <div style={styles.calendarContainer}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              popup
              selectable
            />
          </div>

          {/* LEGEND */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div
                style={{
                  ...styles.legendColor,
                  backgroundColor: "#4285F4",
                }}
              />
              <span>📅 Bookings</span>
            </div>
            <div style={styles.legendItem}>
              <div
                style={{
                  ...styles.legendColor,
                  backgroundColor: "#FF6347",
                }}
              />
              <span>🚨 Incidents</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ fontSize: "12px", color: "#999" }}>
                {events.length} events total
              </span>
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#999",
          }}
        >
          <p style={{ fontSize: "16px" }}>📭 Select a resource to view calendar</p>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {showEventDetails && selectedEvent && (
        <div style={styles.modal} onClick={() => setShowEventDetails(false)}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalTitle}>{selectedEvent.title}</div>

            <div style={styles.modalInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Type</span>
                <span style={styles.infoValue}>
                  {selectedEvent.type === "BOOKING" ? "📅 Booking" : "🚨 Incident"}
                </span>
              </div>

              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Start</span>
                <span style={styles.infoValue}>
                  {selectedEvent.start.toLocaleString()}
                </span>
              </div>

              {selectedEvent.type === "BOOKING" && (
                <>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>End</span>
                    <span style={styles.infoValue}>
                      {selectedEvent.end.toLocaleString()}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Duration</span>
                    <span style={styles.infoValue}>
                      {Math.round(
                        (selectedEvent.end - selectedEvent.start) / (1000 * 60)
                      )}{" "}
                      minutes
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Booked By</span>
                    <span style={styles.infoValue}>
                      {selectedEvent.resource.bookedBy}
                    </span>
                  </div>
                </>
              )}

              {selectedEvent.type === "INCIDENT" && (
                <>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Priority</span>
                    <span
                      style={{
                        ...styles.infoValue,
                        color:
                          selectedEvent.resource.priority === "CRITICAL"
                            ? "#DC143C"
                            : "#FF6347",
                        fontWeight: "600",
                      }}
                    >
                      {selectedEvent.resource.priority}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Status</span>
                    <span style={styles.infoValue}>
                      {selectedEvent.resource.status}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Reported By</span>
                    <span style={styles.infoValue}>
                      {selectedEvent.resource.reportedBy}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Description</span>
                    <span style={{ ...styles.infoValue, marginTop: "5px" }}>
                      {selectedEvent.resource.description}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              style={styles.closeButton}
              onClick={() => setShowEventDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;