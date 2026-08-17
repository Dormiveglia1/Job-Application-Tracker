import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { apiRequest } from "../services/api";
import { Link } from "react-router-dom";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import "../App.css";
import AppSidebar from "../components/AppSidebar";

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("careerflow_token");

      try {
        const data = await apiRequest("/dashboard/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSummary(data);
      } catch (error) {
        setErrorMessage(error.message);
      }
    }

    loadDashboard();
  }, []);

  const statusCounts = summary?.statusCounts || {};

  const totalApplications = Object.values(statusCounts).reduce(
    (total, count) => total + Number(count),
    0,
  );

  const interviewStageApplications =
    Number(statusCounts.interview || 0) + Number(statusCounts.offer || 0);

  const interviewRate =
    totalApplications === 0
      ? 0
      : Math.round((interviewStageApplications / totalApplications) * 100);

  const dashboardStats = [
    {
      label: "Total applications",
      value: totalApplications,
    },
    {
      label: "Interviews",
      value: statusCounts.interview || 0,
    },
    {
      label: "Offers",
      value: statusCounts.offer || 0,
    },
    {
      label: "Interview rate",
      value: `${interviewRate}%`,
    },
  ];
  const monthlyApplications = summary?.monthlyApplications || [];
  const categoryDistribution = summary?.categoryDistribution || [];

  const nextInterview = summary?.nextInterview;

  const formattedNextInterviewDate = nextInterview
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(nextInterview.interview_date))
    : null;

  const statusItems = [
    { value: "applied", label: "Applied" },
    { value: "interview", label: "Interview" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
    { value: "archived", label: "Archived" },
  ];

  const maxCategoryCount = Math.max(
    ...categoryDistribution.map((item) => Number(item.count)),
    1,
  );
  return (
    <div className="app-shell">
      <AppSidebar />

      <div className="page-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>

          <Link to="/applications/new" className="primary-button">
            + Add application
          </Link>
        </header>

        <main className="dashboard">
          <section className="dashboard-intro">
            <h2>Keep your job search moving forward.</h2>
            <p>Here is a snapshot of your application progress.</p>
          </section>

          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}

          {!summary && !errorMessage ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              <section
                className="stat-grid"
                aria-label="Application statistics"
              >
                {dashboardStats.map((stat) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                  />
                ))}
              </section>

              <section className="next-interview-card">
                <div>
                  <p className="eyebrow">UP NEXT</p>

                  {nextInterview ? (
                    <>
                      <h2>
                        {nextInterview.position} · {nextInterview.company}
                      </h2>
                      <p>
                        Your next interview is {formattedNextInterviewDate}.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>No upcoming interviews</h2>
                      <p>
                        When you schedule an interview, its date will appear
                        here.
                      </p>
                    </>
                  )}
                </div>

                {nextInterview && (
                  <Link
                    className="secondary-button"
                    to={`/applications/${nextInterview.id}/edit`}
                  >
                    View application
                  </Link>
                )}
              </section>
            </>
          )}
          {summary && (
            <section className="insight-grid">
              <article className="insight-card">
                <h2>Monthly applications</h2>

                {monthlyApplications.length === 0 ? (
                  <p className="empty-insight">No application data yet.</p>
                ) : (
                  <MonthlyTrendChart data={monthlyApplications} />
                )}
              </article>

              <article className="insight-card">
                <h2>Applications by category</h2>

                {categoryDistribution.length === 0 ? (
                  <p className="empty-insight">No category data yet.</p>
                ) : (
                  <div className="bar-chart">
                    {categoryDistribution.map((item) => (
                      <div className="bar-chart-row" key={item.category}>
                        <span className="bar-chart-label">{item.category}</span>

                        <div className="bar-chart-track">
                          <span
                            className="bar-chart-fill category-bar"
                            style={{
                              width: `${
                                (Number(item.count) / maxCategoryCount) * 100
                              }%`,
                            }}
                          />
                        </div>

                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </article>
              <article className="insight-card status-summary">
                <h2>Applications by status</h2>

                <div className="status-summary-grid">
                  {statusItems.map((statusItem) => (
                    <div className="status-summary-item" key={statusItem.value}>
                      <span
                        className={`status-badge status-${statusItem.value}`}
                      >
                        {statusItem.label}
                      </span>

                      <strong>{statusCounts[statusItem.value] || 0}</strong>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
