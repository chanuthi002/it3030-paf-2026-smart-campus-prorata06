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

  // 🎨 Modern Styles
  const pageStyle = {
    padding: "24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const contentStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const headerStyle = {
    marginBottom: "24px",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "white",
    margin: "0 0 8px 0",
    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
  };

  const subtitleStyle = {
    color: "rgba(255,255,255,0.9)",
    marginTop: 0,
    fontSize: "14px",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  };

  const statCardStyle = (color) => ({
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderLeft: `4px solid ${color}`,
    transition: "transform 0.3s ease",
  });

  const analyticsCardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  };

  const filterBarStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  };

  const selectStyle = {
    padding: "10px 12px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
  };

  const resetButtonStyle = {
    padding: "10px 16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#dc3545",
    transition: "all 0.3s ease",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    overflowX: "auto",
  };

  const tableHeaderStyle = {
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #e0e0e0",
  };

  const tableHeaderCellStyle = {
    padding: "14px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#4a5568",
    fontSize: "13px",
  };

  const tableRowStyle = {
    borderBottom: "1px solid #e2e8f0",
    transition: "background-color 0.2s ease",
  };

  const tableCellStyle = {
    padding: "12px",
    fontSize: "13px",
    color: "#1a1a2e",
  };

  const statusBadgeStyle = (status) => {
    const colors = {
      Available: { bg: "#d4edda", color: "#155724", icon: "🟢" },
      Booked: { bg: "#fff3cd", color: "#856404", icon: "🟡" },
      Maintenance: { bg: "#f8d7da", color: "#721c24", icon: "🔴" },
    };
    const style = colors[status] || colors.Available;
    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "12px",
      backgroundColor: style.bg,
      color: style.color,
      fontSize: "12px",
      fontWeight: "600",
    };
  };

  const loadingOverlayStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    fontSize: "16px",
    color: "#666",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={contentStyle}>
          <div style={cardStyle}>
            <div style={loadingOverlayStyle}>
              <span>📊 Loading dashboard data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>📊 Resource Admin Dashboard</h1>
          <p style={subtitleStyle}>Overview, availability, usage analytics, and downloadable reporting</p>
        </div>

        {/* Stats Cards */}
        <div style={statsGridStyle}>
          <div style={statCardStyle("#4361ee")}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Total Resources</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#1a1a2e" }}>{statusSummary.total}</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>All resources</div>
          </div>
          <div style={statCardStyle("#22c55e")}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Available</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#166534" }}>{statusSummary.available}</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>Ready to book</div>
          </div>
          <div style={statCardStyle("#f59e0b")}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Booked</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#92400e" }}>{statusSummary.booked}</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>Currently in use</div>
          </div>
          <div style={statCardStyle("#ef4444")}>
            <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Maintenance</div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#991b1b" }}>{statusSummary.maintenance}</div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>Out of service</div>
          </div>
        </div>

        {/* Analytics Section */}
        <div style={analyticsCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a1a2e" }}>📈 Analytics</h3>
            <button
              onClick={generatePdfReport}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(13, 148, 136, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              📄 Generate PDF Report
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}>
            <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#4a5568" }}>Resource Availability Split</h4>
              <Pie
                data={{
                  labels: ["Available", "Booked", "Maintenance"],
                  datasets: [
                    {
                      data: [statusSummary.available, statusSummary.booked, statusSummary.maintenance],
                      backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>

            <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#4a5568" }}>Usage Statistics</h4>
              <Bar
                data={{
                  labels: ["Daily", "Weekly", "Monthly"],
                  datasets: [
                    {
                      label: "Total Bookings",
                      data: [
                        Object.values(usageByDay).reduce((sum, value) => sum + value, 0),
                        Object.values(usageByWeek).reduce((sum, value) => sum + value, 0),
                        Object.values(usageByMonth).reduce((sum, value) => sum + value, 0),
                      ],
                      backgroundColor: ["#0284c7", "#0ea5e9", "#38bdf8"],
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </div>

            <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#4a5568" }}>Most Used Resources</h4>
              <Bar
                data={{
                  labels: mostUsedResources.map(([name]) => name.length > 20 ? name.slice(0, 20) + "..." : name),
                  datasets: [
                    {
                      label: "Total Bookings",
                      data: mostUsedResources.map(([, value]) => value),
                      backgroundColor: "#0f766e",
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Resources Table Section */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600", color: "#1a1a2e" }}>📋 Resource Availability List</h3>

          {/* Filters */}
          <div style={filterBarStyle}>
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              style={selectStyle}
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
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
              style={selectStyle}
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
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
              style={selectStyle}
              onFocus={(e) => e.target.style.borderColor = "#4361ee"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            <button
              onClick={() => setFilters({ type: "", location: "", status: "" })}
              style={resetButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc3545";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "#dc3545";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.color = "#dc3545";
                e.currentTarget.style.borderColor = "#e0e0e0";
              }}
            >
              🔄 Reset Filters
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={tableHeaderCellStyle}>Resource Name</th>
                  <th style={tableHeaderCellStyle}>Type</th>
                  <th style={tableHeaderCellStyle}>Location</th>
                  <th style={tableHeaderCellStyle}>Capacity</th>
                  <th style={tableHeaderCellStyle}>Status</th>
                  <th style={tableHeaderCellStyle}>Remaining Time Today</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource, index) => (
                  <tr 
                    key={resource.id} 
                    style={{
                      ...tableRowStyle,
                      backgroundColor: index % 2 === 0 ? "white" : "#fafafa",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#fafafa";
                    }}
                  >
                    <td style={tableCellStyle}>
                      <strong>{resource.name}</strong>
                    </td>
                    <td style={tableCellStyle}>{resource.type}</td>
                    <td style={tableCellStyle}>{resource.location}</td>
                    <td style={tableCellStyle}>{resource.capacity}</td>
                    <td style={tableCellStyle}>
                      <span style={statusBadgeStyle(resource.currentStatus)}>
                        {resource.currentStatus}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        fontWeight: "600",
                        color: resource.remainingMinutes > 0 ? "#22c55e" : "#ef4444",
                      }}>
                        {minutesToLabel(resource.remainingMinutes)}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && filteredResources.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#999" }}>
                      <div>📭 No resources found for selected filters</div>
                      <div style={{ fontSize: "12px", marginTop: "8px" }}>Try adjusting your filter criteria</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Loading indicator in table */}
          {loading && (
            <div style={loadingOverlayStyle}>
              <span>⏳ Loading resources...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceAdminDashboard;