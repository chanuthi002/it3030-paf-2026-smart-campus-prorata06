import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { getBookingsByResource } from "../services/api";

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

  useEffect(() => {
    if (resource) {
      getBookingsByResource(resource.id).then((res) => {
        const mapped = res.data.map((b) => ({
          title: "Booked",
          start: new Date(`${b.date}T${b.startTime}`),
          end: new Date(`${b.date}T${b.endTime}`),
        }));

        setEvents(mapped);
      });
    }
  }, [resource]);

  return (
    <div style={{ height: "500px", marginTop: "20px" }}>
      <h3>Calendar View: {resource?.name}</h3>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
      />
    </div>
  );
}

export default CalendarView;