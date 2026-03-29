import { useEffect, useMemo, useState } from "react";
import { getAllBookings, getAllResources, getAvailabilityByResource } from "../services/api";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DASHBOARD_DAY_START = 8;
const DASHBOARD_DAY_END = 18;

function toMinutes(timeValue) {
  if (!timeValue) return 0;
  const [hour, minute] = String(timeValue).split(":").map(Number);
  return (hour || 0) * 60 + (minute || 0);
}

function minutesToLabel(minutes) {
  const safe = Math.max(0, minutes);
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${hours}h ${mins}m`;
}

function normalizeDateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  return new Date(value).toISOString().split("T")[0];
}

function getWeekKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toISOString().split("T")[0];
}

function getMonthKey(dateKey) {
  return dateKey.slice(0, 7);
}

function ResourceAdminDashboard() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availabilityByResource, setAvailabilityByResource] = useState({});
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resourcesRes, bookingsRes] = await Promise.all([
        getAllResources(),
        getAllBookings(),
      ]);

      const loadedResources = resourcesRes.data || [];
      const loadedBookings = bookingsRes.data || [];

      setResources(loadedResources);
      setBookings(loadedBookings);

      const availabilityPairs = await Promise.all(
        loadedResources.map(async (resource) => {
          try {
            const response = await getAvailabilityByResource(resource.id);
            return [resource.id, response.data || []];
          } catch (error) {
            return [resource.id, []];
          }
        })
      );

      setAvailabilityByResource(Object.fromEntries(availabilityPairs));
    } catch (error) {
      console.error("Failed to load resource dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== "CANCELLED"),
    [bookings]
  );

  const resourceRows = useMemo(() => {
    return resources.map((resource) => {
      const todaysBookings = activeBookings.filter(
        (booking) => booking.resourceId === resource.id && normalizeDateKey(booking.date) === todayKey
      );

      const todaysAvailability = (availabilityByResource[resource.id] || []).filter(
        (slot) => normalizeDateKey(slot.date) === todayKey
      );

      const availableMinutes = todaysAvailability.reduce((sum, slot) => {
        return sum + Math.max(0, toMinutes(slot.endTime) - toMinutes(slot.startTime));
      }, 0);

      const defaultWorkingMinutes = (DASHBOARD_DAY_END - DASHBOARD_DAY_START) * 60;
      const baselineMinutes = availableMinutes > 0 ? availableMinutes : defaultWorkingMinutes;

      const bookedMinutes = todaysBookings.reduce((sum, booking) => {
        return sum + Math.max(0, toMinutes(booking.endTime) - toMinutes(booking.startTime));
      }, 0);

      const remainingMinutes = Math.max(0, baselineMinutes - bookedMinutes);

      let currentStatus = "Available";
      if (resource.status === "OUT_OF_SERVICE") {
        currentStatus = "Maintenance";
      } else if (todaysBookings.length > 0) {
        currentStatus = "Booked";
      }

      return {
        ...resource,
        currentStatus,
        remainingMinutes,
      };
    });
  }, [resources, activeBookings, availabilityByResource, todayKey]);

  const filteredResources = useMemo(() => {
    return resourceRows.filter((resource) => {
      if (filters.type && resource.type !== filters.type) return false;
      if (filters.location && resource.location !== filters.location) return false;
      if (filters.status && resource.currentStatus !== filters.status) return false;
      return true;
    });
  }, [resourceRows, filters]);

  const usageByDay = useMemo(() => {
    const grouped = {};
    activeBookings.forEach((booking) => {
      const key = normalizeDateKey(booking.date);
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return grouped;
  }, [activeBookings]);

  const usageByWeek = useMemo(() => {
    const grouped = {};
    Object.entries(usageByDay).forEach(([dateKey, count]) => {
      const week = getWeekKey(dateKey);
      grouped[week] = (grouped[week] || 0) + count;
    });
    return grouped;
  }, [usageByDay]);

  const usageByMonth = useMemo(() => {
    const grouped = {};
    Object.entries(usageByDay).forEach(([dateKey, count]) => {
      const month = getMonthKey(dateKey);
      grouped[month] = (grouped[month] || 0) + count;
    });
    return grouped;
  }, [usageByDay]);

  const mostUsedResources = useMemo(() => {
    const grouped = {};
    activeBookings.forEach((booking) => {
      const resource = resources.find((item) => item.id === booking.resourceId);
      const name = resource?.name || String(booking.resourceId);
      grouped[name] = (grouped[name] || 0) + 1;
    });

    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [activeBookings, resources]);

  const statusSummary = useMemo(() => {
    return resourceRows.reduce(
      (summary, resource) => {
        summary.total += 1;
        if (resource.currentStatus === "Available") summary.available += 1;
        if (resource.currentStatus === "Booked") summary.booked += 1;
        if (resource.currentStatus === "Maintenance") summary.maintenance += 1;
        return summary;
      },
      { total: 0, available: 0, booked: 0, maintenance: 0 }
    );
  }, [resourceRows]);

  const generatePdfReport = () => {
    const doc = new jsPDF();
    const reportDate = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("Resource Admin Dashboard Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${reportDate}`, 14, 28);

    doc.text(`Total resources: ${statusSummary.total}`, 14, 38);
    doc.text(`Available: ${statusSummary.available}`, 14, 45);
    doc.text(`Booked: ${statusSummary.booked}`, 14, 52);
    doc.text(`Maintenance: ${statusSummary.maintenance}`, 14, 59);

    autoTable(doc, {
      startY: 68,
      head: [["Resource", "Type", "Location", "Capacity", "Status", "Remaining Today"]],
      body: filteredResources.map((resource) => [
        resource.name,
        resource.type,
        resource.location,
        String(resource.capacity),
        resource.currentStatus,
        minutesToLabel(resource.remainingMinutes),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 118, 110] },
    });

    const afterTableY = doc.lastAutoTable?.finalY || 90;
    doc.text("Usage Summary", 14, afterTableY + 12);

    const usageRows = [
      ["Daily (entries)", String(Object.keys(usageByDay).length)],
      ["Weekly (entries)", String(Object.keys(usageByWeek).length)],
      ["Monthly (entries)", String(Object.keys(usageByMonth).length)],
      ["Total bookings", String(activeBookings.length)],
    ];

    autoTable(doc, {
      startY: afterTableY + 16,
      head: [["Metric", "Value"]],
      body: usageRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [12, 74, 110] },
    });

    doc.save(`resource-admin-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const typeOptions = [...new Set(resourceRows.map((resource) => resource.type))];
  const locationOptions = [...new Set(resourceRows.map((resource) => resource.location))];

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  };

  return (
    <div style={{ padding: "8px" }}>
      <h2 style={{ marginBottom: "6px" }}>Resource Admin Dashboard</h2>
      <p style={{ color: "#555", marginTop: 0 }}>
        Overview, availability, usage analytics, and downloadable reporting.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div style={cardStyle}>
          <div style={{ color: "#666", fontSize: "13px" }}>Total Resources</div>
          <div style={{ fontSize: "26px", fontWeight: "700" }}>{statusSummary.total}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#666", fontSize: "13px" }}>Available</div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#166534" }}>{statusSummary.available}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#666", fontSize: "13px" }}>Booked</div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#92400e" }}>{statusSummary.booked}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#666", fontSize: "13px" }}>Maintenance</div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#991b1b" }}>
            {statusSummary.maintenance}
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0 }}>Analytics</h3>
          <button
            onClick={generatePdfReport}
            style={{
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              backgroundColor: "#0f766e",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Generate PDF Report
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
            marginTop: "14px",
          }}
        >
          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Availability Split</h4>
            <Pie
              data={{
                labels: ["Available", "Booked", "Maintenance"],
                datasets: [
                  {
                    data: [statusSummary.available, statusSummary.booked, statusSummary.maintenance],
                    backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
                  },
                ],
              }}
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Usage Stats (Daily / Weekly / Monthly)</h4>
            <Bar
              data={{
                labels: ["Daily", "Weekly", "Monthly"],
                datasets: [
                  {
                    label: "Total usage entries",
                    data: [
                      Object.values(usageByDay).reduce((sum, value) => sum + value, 0),
                      Object.values(usageByWeek).reduce((sum, value) => sum + value, 0),
                      Object.values(usageByMonth).reduce((sum, value) => sum + value, 0),
                    ],
                    backgroundColor: ["#0284c7", "#0ea5e9", "#38bdf8"],
                  },
                ],
              }}
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Most Frequently Used Resources</h4>
            <Bar
              data={{
                labels: mostUsedResources.map(([name]) => name),
                datasets: [
                  {
                    label: "Bookings",
                    data: mostUsedResources.map(([, value]) => value),
                    backgroundColor: "#0f766e",
                  },
                ],
              }}
              options={{ indexAxis: "y" }}
            />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Current Availability List</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <select
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            style={{ padding: "8px" }}
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
            style={{ padding: "8px" }}
          >
            <option value="">All Locations</option>
            {locationOptions.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            style={{ padding: "8px" }}
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button
            onClick={() => setFilters({ type: "", location: "", status: "" })}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Resource Name</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Type</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Location</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Capacity</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Remaining Time Today</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((resource) => (
                <tr key={resource.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px" }}>{resource.name}</td>
                  <td style={{ padding: "10px" }}>{resource.type}</td>
                  <td style={{ padding: "10px" }}>{resource.location}</td>
                  <td style={{ padding: "10px" }}>{resource.capacity}</td>
                  <td style={{ padding: "10px" }}>{resource.currentStatus}</td>
                  <td style={{ padding: "10px" }}>{minutesToLabel(resource.remainingMinutes)}</td>
                </tr>
              ))}
              {!loading && filteredResources.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                    No resources found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ResourceAdminDashboard;
