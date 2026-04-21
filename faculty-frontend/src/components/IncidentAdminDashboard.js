import { useEffect, useMemo, useState } from "react";
import { getAllIncidents, getAllResources } from "../services/api";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function normalizeDateKey(value) {
  if (!value) return "";
  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function normalizeSeverity(priority) {
  const normalizedPriority = String(priority || "").toUpperCase();
  if (!normalizedPriority) return "Medium";
  if (normalizedPriority === "CRITICAL" || normalizedPriority === "HIGH") return "High";
  if (normalizedPriority === "LOW") return "Low";
  return "Medium";
}

function normalizeStatus(status) {
  const normalizedStatus = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(normalizedStatus)) {
    return normalizedStatus;
  }

  return "OPEN";
}

function monthLabel(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function IncidentAdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [resourcesMap, setResourcesMap] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    severity: "",
    date: "",
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incidentsRes, resourcesRes] = await Promise.all([getAllIncidents(), getAllResources()]);
      const loadedIncidents = incidentsRes.data || [];
      const loadedResources = resourcesRes.data || [];

      setIncidents(loadedIncidents);
      setResourcesMap(
        Object.fromEntries(loadedResources.map((resource) => [resource.id, resource.name]))
      );
    } catch (error) {
      console.error("Failed to load incident dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const enrichedIncidents = useMemo(() => {
    return incidents.map((incident) => ({
      ...incident,
      normalizedStatus: normalizeStatus(incident.status),
      severity: normalizeSeverity(incident.priority),
      dateKey: normalizeDateKey(incident.createdAt),
      resourceName: resourcesMap[incident.resourceId] || String(incident.resourceId || "N/A"),
    }));
  }, [incidents, resourcesMap]);

  const filteredIncidents = useMemo(() => {
    return enrichedIncidents.filter((incident) => {
      if (filters.status && incident.normalizedStatus !== filters.status) return false;
      if (filters.severity && incident.severity !== filters.severity) return false;
      if (filters.date && incident.dateKey !== filters.date) return false;
      return true;
    });
  }, [enrichedIncidents, filters]);

  const totalCount = enrichedIncidents.length;

  const statusCounts = useMemo(() => {
    return enrichedIncidents.reduce(
      (summary, incident) => {
        summary[incident.normalizedStatus] = (summary[incident.normalizedStatus] || 0) + 1;
        return summary;
      },
      { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 }
    );
  }, [enrichedIncidents]);

  const severityCounts = useMemo(() => {
    return enrichedIncidents.reduce(
      (summary, incident) => {
        summary[incident.severity] = (summary[incident.severity] || 0) + 1;
        return summary;
      },
      { Low: 0, Medium: 0, High: 0 }
    );
  }, [enrichedIncidents]);

  const monthlyTrends = useMemo(() => {
    const grouped = {};
    enrichedIncidents.forEach((incident) => {
      const month = monthLabel(incident.createdAt);
      if (!month) return;
      grouped[month] = (grouped[month] || 0) + 1;
    });

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [enrichedIncidents]);

  const resolutionStats = useMemo(() => {
    const resolvedCount = statusCounts.RESOLVED + statusCounts.CLOSED;
    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

    return {
      resolvedCount,
      resolutionRate,
      unresolvedCount: totalCount - resolvedCount,
    };
  }, [statusCounts, totalCount]);

  const generatePdfReport = () => {
    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text("Incident Admin Dashboard Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${generatedAt}`, 14, 28);

    doc.text(`Total incidents: ${totalCount}`, 14, 38);
    doc.text(`Open: ${statusCounts.OPEN}`, 14, 45);
    doc.text(`In progress: ${statusCounts.IN_PROGRESS}`, 14, 52);
    doc.text(`Resolved: ${statusCounts.RESOLVED}`, 14, 59);
    doc.text(`Closed: ${statusCounts.CLOSED}`, 14, 66);

    doc.text("Status Breakdown", 14, 76);
    autoTable(doc, {
      startY: 80,
      head: [["Status", "Count"]],
      body: [
        ["OPEN", String(statusCounts.OPEN)],
        ["IN_PROGRESS", String(statusCounts.IN_PROGRESS)],
        ["RESOLVED", String(statusCounts.RESOLVED)],
        ["CLOSED", String(statusCounts.CLOSED)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [124, 45, 18] },
    });

    const tableY = doc.lastAutoTable?.finalY || 110;
    doc.text("Resolution Statistics", 14, tableY + 12);
    autoTable(doc, {
      startY: tableY + 16,
      head: [["Metric", "Value"]],
      body: [
        ["Resolved incidents", String(resolutionStats.resolvedCount)],
        ["Unresolved incidents", String(resolutionStats.unresolvedCount)],
        ["Resolution rate", `${resolutionStats.resolutionRate}%`],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [180, 83, 9] },
    });

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 150) + 10,
      head: [["Title", "Resource", "Severity", "Status", "Reported Date"]],
      body: filteredIncidents.map((incident) => [
        incident.title,
        incident.resourceName,
        incident.severity,
        incident.normalizedStatus,
        incident.dateKey,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [2, 132, 199] },
    });

    doc.save(`incident-admin-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const statusOptions = [...new Set(enrichedIncidents.map((incident) => incident.normalizedStatus))];

  const chartCountOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  };

  return (
    <div style={{ padding: "8px" }}>
      <h2 style={{ marginBottom: "6px" }}>Incident Admin Dashboard</h2>
      <p style={{ color: "#555", marginTop: 0 }}>
        Incident analytics, status tracking, severity overview, and downloadable reports.
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
          <div style={{ color: "#666", fontSize: "13px" }}>Total Incidents</div>
          <div style={{ fontSize: "26px", fontWeight: "700" }}>{totalCount}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#666", fontSize: "13px" }}>Open</div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#991b1b" }}>{statusCounts.OPEN}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#666", fontSize: "13px" }}>In Progress</div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#92400e" }}>{statusCounts.IN_PROGRESS}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#666", fontSize: "13px" }}>Resolved + Closed</div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#166534" }}>
            {resolutionStats.resolvedCount}
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
              backgroundColor: "#7c2d12",
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
            <h4 style={{ margin: "0 0 8px 0" }}>Incidents By Status</h4>
            <Pie
              data={{
                labels: ["Open", "In Progress", "Resolved", "Closed"],
                datasets: [
                  {
                    data: [
                      statusCounts.OPEN,
                      statusCounts.IN_PROGRESS,
                      statusCounts.RESOLVED,
                      statusCounts.CLOSED,
                    ],
                    backgroundColor: ["#ef4444", "#f59e0b", "#10b981", "#64748b"],
                  },
                ],
              }}
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Incidents By Severity</h4>
            <Bar
              options={chartCountOptions}
              data={{
                labels: ["Low", "Medium", "High"],
                datasets: [
                  {
                    label: "Incidents",
                    data: [severityCounts.Low, severityCounts.Medium, severityCounts.High],
                    backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
                  },
                ],
              }}
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px 0" }}>Monthly Incident Trends</h4>
            <Line
              options={lineChartOptions}
              data={{
                labels: monthlyTrends.map(([month]) => month),
                datasets: [
                  {
                    label: "Incidents",
                    data: monthlyTrends.map(([, count]) => count),
                    borderColor: "#7c2d12",
                    backgroundColor: "rgba(124, 45, 18, 0.15)",
                    tension: 0.25,
                    fill: true,
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>Incident Overview List</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            style={{ padding: "8px" }}
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={filters.severity}
            onChange={(event) => setFilters((prev) => ({ ...prev, severity: event.target.value }))}
            style={{ padding: "8px" }}
          >
            <option value="">All Severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            style={{ padding: "8px" }}
          />

          <button
            onClick={() => setFilters({ status: "", severity: "", date: "" })}
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
                <th style={{ padding: "10px", textAlign: "left" }}>Incident Title</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Related Resource</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Severity</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Reported Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px" }}>{incident.title}</td>
                  <td style={{ padding: "10px" }}>{incident.resourceName}</td>
                  <td style={{ padding: "10px" }}>{incident.severity}</td>
                  <td style={{ padding: "10px" }}>{incident.normalizedStatus}</td>
                  <td style={{ padding: "10px" }}>{incident.dateKey}</td>
                </tr>
              ))}
              {!loading && filteredIncidents.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                    No incidents found for selected filters.
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

export default IncidentAdminDashboard;
