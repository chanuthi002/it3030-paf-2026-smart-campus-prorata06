import { useEffect, useState } from "react";
import {
  getAllBookings,
  cancelBooking,
  getAllResources,
} from "../services/api";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function AdminBookingDashboard({ onClose }) {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    resourceId: "",
    status: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const loadData = async () => {
    try {
      const [bookingsRes, resourcesRes] = await Promise.all([
        getAllBookings(),
        getAllResources(),
      ]);
      setBookings(bookingsRes.data);
      setResources(resourcesRes.data);
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  const applyFilters = () => {
    let filtered = bookings;

    if (filters.date) {
      filtered = filtered.filter(
        (b) => b.date === filters.date
      );
    }

    if (filters.resourceId) {
      filtered = filtered.filter(
        (b) => b.resourceId === filters.resourceId
      );
    }

    if (filters.status) {
      filtered = filtered.filter(
        (b) => b.status === filters.status
      );
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(bookingId);
      loadData();
      alert("Booking cancelled successfully");
    } catch (err) {
      alert("Error cancelling booking: " + (err.response?.data || err.message));
    }
  };

  const getResourceName = (resourceId) => {
    const resource = resources.find((r) => r.id === resourceId);
    return resource?.name || resourceId;
  };

  // Analytics
  const getBookingsPerDay = () => {
    const counts = {};
    bookings.forEach((b) => {
      const date = b.date;
      counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  };

  const getMostUsedResources = () => {
    const counts = {};
    bookings.forEach((b) => {
      const name = getResourceName(b.resourceId);
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  };

  const getPeakHours = () => {
    const counts = {};
    bookings.forEach((b) => {
      const hour = b.startTime.split(":")[0];
      counts[hour] = (counts[hour] || 0) + 1;
    });
    return counts;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const today = new Date().toISOString().split("T")[0];

    // Title
    doc.setFontSize(20);
    doc.text("Booking Report - " + today, 20, 20);

    // Summary
    doc.setFontSize(12);
    doc.text(`Total Bookings: ${filteredBookings.length}`, 20, 40);

    // Analytics
    const bookingsPerDay = getBookingsPerDay();
    const mostUsed = getMostUsedResources();
    const peakHours = getPeakHours();

    doc.text("Bookings per Day:", 20, 60);
    let y = 70;
    Object.entries(bookingsPerDay).forEach(([date, count]) => {
      doc.text(`${date}: ${count}`, 30, y);
      y += 10;
    });

    // Table
    const tableData = filteredBookings.map((b) => [
      b.id,
      getResourceName(b.resourceId),
      b.bookedBy,
      b.date,
      b.startTime + " - " + b.endTime,
      b.status,
    ]);

    autoTable(doc, {
      head: [["ID", "Resource", "User", "Date", "Time", "Status"]],
      body: tableData,
      startY: y + 20,
    });

    doc.save(`booking-report-${today}.pdf`);
  };

  const bookingsPerDayData = {
    labels: Object.keys(getBookingsPerDay()),
    datasets: [
      {
        label: "Bookings per Day",
        data: Object.values(getBookingsPerDay()),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const resourcesData = {
    labels: Object.keys(getMostUsedResources()),
    datasets: [
      {
        data: Object.values(getMostUsedResources()),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  const peakHoursData = {
    labels: Object.keys(getPeakHours()).sort(),
    datasets: [
      {
        label: "Bookings by Hour",
        data: Object.values(getPeakHours()),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>📊 Admin Booking Dashboard</h2>
        <button onClick={onClose} style={closeButtonStyle}>
          ❌
        </button>

        {/* Filters */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            placeholder="Filter by date"
          />
          <select
            value={filters.resourceId}
            onChange={(e) => setFilters({ ...filters, resourceId: e.target.value })}
          >
            <option value="">All Resources</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button onClick={generatePDF} style={pdfButtonStyle}>
            📄 Generate PDF Report
          </button>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: "20px" }}>
          <h3>Summary</h3>
          <p>Total Bookings: {filteredBookings.length}</p>
        </div>

        {/* Charts */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <h4>Bookings per Day</h4>
            <Bar data={bookingsPerDayData} />
          </div>
          <div style={{ flex: 1 }}>
            <h4>Most Used Resources</h4>
            <Pie data={resourcesData} />
          </div>
          <div style={{ flex: 1 }}>
            <h4>Peak Booking Hours</h4>
            <Line data={peakHoursData} />
          </div>
        </div>

        {/* Bookings Table */}
        {/* Bookings Table */}
<div style={{
  maxHeight: "400px",
  overflowY: "auto",
  borderRadius: "12px",
  border: "1px solid #e0e0e0",
  marginTop: "20px",
}}>
  <table style={tableStyle}>
    <thead>
      <tr>
        <th style={tableHeaderStyle}>ID</th>
        <th style={tableHeaderStyle}>Resource</th>
        <th style={tableHeaderStyle}>User</th>
        <th style={tableHeaderStyle}>Date</th>
        <th style={tableHeaderStyle}>Time</th>
        <th style={tableHeaderStyle}>Status</th>
        <th style={tableHeaderStyle}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredBookings.map((b, index) => (
        <tr
          key={b.id}
          style={{
            ...tableRowStyle,
            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9ff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#eef0ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              index % 2 === 0 ? "#ffffff" : "#f8f9ff";
          }}
        >
          <td style={tableCellStyle}>
            <span style={{
              background: "#f0f0f0",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "600",
              color: "#555",
            }}>
              #{b.id}
            </span>
          </td>

          <td style={tableCellStyle}>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "500",
            }}>
              🏫 {getResourceName(b.resourceId)}
            </span>
          </td>

          <td style={tableCellStyle}>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              👤 {b.bookedBy}
            </span>
          </td>

          <td style={tableCellStyle}>
            <span style={{
              background: "#e3f2fd",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#1976d2",
            }}>
              {b.date}
            </span>
          </td>

          <td style={tableCellStyle}>
            <span style={{
              background: "#f3e5f5",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#7b1fa2",
            }}>
              ⏰{b.startTime} - {b.endTime}
            </span>
          </td>

          <td style={tableCellStyle}>
            <span style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: "700",
              backgroundColor:
                b.status === "ACTIVE" ? "#d4edda" :
                b.status === "CANCELLED" ? "#f8d7da" : "#d1ecf1",
              color:
                b.status === "ACTIVE" ? "#155724" :
                b.status === "CANCELLED" ? "#721c24" : "#0c5460",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              {b.status === "ACTIVE" ? "✅ Active" :
               b.status === "CANCELLED" ? "❌Cancelled" : "✔ Completed"}
            </span>
          </td>

          <td style={tableCellStyle}>
            {b.status === "ACTIVE" && (
              <button
                onClick={() => handleCancelBooking(b.id)}
                style={cancelButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#c82333";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🚫 Cancel
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "95%",
  maxWidth: "1200px",
  maxHeight: "90vh",
  overflowY: "auto",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
};

const pdfButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  fontSize: "14px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  borderRadius: "12px",
  overflow: "hidden",
};

const tableHeaderStyle = {
  backgroundColor: "#4361ee",
  color: "white",
  padding: "14px 16px",
  textAlign: "left",
  fontWeight: "600",
  fontSize: "13px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const tableRowStyle = {
  borderBottom: "1px solid #f0f0f0",
  transition: "background-color 0.2s ease",
  cursor: "default",
};

const tableCellStyle = {
  padding: "12px 16px",
  color: "#2d3748",
  fontSize: "13px",
  verticalAlign: "middle",
};

const cancelButtonStyle = {
  padding: "6px 14px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 6px rgba(220, 53, 69, 0.3)",
};

export default AdminBookingDashboard;