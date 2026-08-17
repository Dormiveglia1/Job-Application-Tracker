import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ApplicationTable from "../components/ApplicationTable";
import { apiRequest } from "../services/api";
import "../App.css";
import AppSidebar from "../components/AppSidebar";

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("applicationDate");

  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const [pendingInterview, setPendingInterview] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewDateError, setInterviewDateError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      const token = localStorage.getItem("careerflow_token");

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: "10",
        sortBy,
        order,
      });

      if (includeArchived) {
        queryParams.set("includeArchived", "true");
      }

      if (search.trim()) {
        queryParams.set("search", search.trim());
      }

      if (status) {
        queryParams.set("status", status);
      }

      if (category.trim()) {
        queryParams.set("category", category.trim());
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await apiRequest(
          `/applications?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setApplications(data.applications);
        setPagination(data.pagination);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, [
    search,
    status,
    category,
    sortBy,
    order,
    page,
    reloadKey,
    includeArchived,
  ]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCategory("");
    setSortBy("applicationDate");
    setOrder("desc");
    setIncludeArchived(false);
    setPage(1);
    setAreFiltersOpen(false);
  }

  async function handleDelete(application) {
    const shouldDelete = window.confirm(
      `Delete the application for ${application.position} at ${application.company}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("careerflow_token");

      await apiRequest(`/applications/${application.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReloadKey((currentKey) => currentKey + 1);
    } catch (deleteError) {
      setErrorMessage(deleteError.message);
    }
  }

  async function handleArchiveToggle(application) {
    const isArchived = application.status === "archived";
    const nextStatus = isArchived ? "applied" : "archived";
    const action = isArchived ? "restore" : "archive";

    const shouldContinue = window.confirm(
      `Do you want to ${action} the application for ${application.position} at ${application.company}?`,
    );

    if (!shouldContinue) {
      return;
    }

    try {
      await updateApplicationStatus(application, nextStatus);
    } catch (archiveError) {
      setErrorMessage(archiveError.message);
    }
  }

  async function updateApplicationStatus(
    application,
    newStatus,
    selectedInterviewDate,
  ) {
    const token = localStorage.getItem("careerflow_token");

    await apiRequest(`/applications/${application.id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: newStatus,
        interviewDate: selectedInterviewDate,
      }),
    });

    setReloadKey((currentKey) => currentKey + 1);
  }

  function handleStatusChange(application, newStatus) {
    if (newStatus === application.status) {
      return;
    }

    if (newStatus === "interview") {
      setPendingInterview(application);
      setInterviewDate("");
      setInterviewDateError("");
      return;
    }

    updateApplicationStatus(application, newStatus).catch((statusError) => {
      setErrorMessage(statusError.message);
      setReloadKey((currentKey) => currentKey + 1);
    });
  }

  async function handleInterviewStatusSubmit(event) {
    event.preventDefault();

    if (!interviewDate) {
      setInterviewDateError("Please choose an interview date and time.");
      return;
    }

    try {
      await updateApplicationStatus(
        pendingInterview,
        "interview",
        interviewDate,
      );

      setPendingInterview(null);
      setInterviewDate("");
      setInterviewDateError("");
    } catch (statusError) {
      setInterviewDateError(statusError.message);
    }
  }

  function closeInterviewModal() {
    setPendingInterview(null);
    setInterviewDate("");
    setInterviewDateError("");
    setReloadKey((currentKey) => currentKey + 1);
  }

  return (
    <div className="app-shell">
      <AppSidebar />

      <div className="page-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">APPLICATIONS</p>
            <h1>Applications</h1>
          </div>

          <Link to="/applications/new" className="primary-button">
            + Add application
          </Link>
        </header>

        <main className="dashboard">
          <section className="recent-applications">
            <div className="section-heading">
              <div>
                <h2>Your applications</h2>
                <p>
                  {pagination
                    ? `${pagination.total} applications in your tracker.`
                    : "Loading your applications..."}
                </p>
              </div>
            </div>

            <section className="application-filters" aria-label="Filters">
              <label className="filter-field filter-search">
                Search
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Company or position"
                />
              </label>

              <button
                type="button"
                className="filter-toggle-button"
                aria-expanded={areFiltersOpen}
                aria-controls="advanced-application-filters"
                onClick={() => setAreFiltersOpen((isOpen) => !isOpen)}
              >
                {areFiltersOpen ? "Hide filters" : "Filters"}
              </button>

              <div
                id="advanced-application-filters"
                className={`filter-options${areFiltersOpen ? " is-open" : ""}`}
              >
                <label className="filter-field">
                Status
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All active statuses</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="archived">Archived</option>
                </select>
                </label>

                <label className="filter-field">
                Category
                <input
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Frontend"
                />
                </label>

                <label className="filter-field">
                Sort by
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="applicationDate">Application date</option>
                  <option value="createdAt">Created date</option>
                  <option value="company">Company</option>
                </select>
                </label>

                <label className="filter-field">
                Order
                <select
                  value={order}
                  onChange={(event) => setOrder(event.target.value)}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                </label>

                <label className="archive-filter">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(event) => {
                    setIncludeArchived(event.target.checked);
                    setPage(1);
                  }}
                />
                Include archived
                </label>

                <button
                type="button"
                className="reset-filters-button"
                onClick={resetFilters}
              >
                Reset filters
                </button>
              </div>
            </section>

            {errorMessage && (
              <p className="form-error" role="alert">
                {errorMessage}
              </p>
            )}

            {isLoading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p>No applications match the current filters.</p>
            ) : (
              <>
                <ApplicationTable
                  applications={applications}
                  onArchiveToggle={handleArchiveToggle}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />

                {pagination?.totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => currentPage - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </button>

                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage((currentPage) => currentPage + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
      {pendingInterview && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="interview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-modal-title"
          >
            <p className="eyebrow">STATUS UPDATE</p>
            <h2 id="interview-modal-title">Schedule an interview</h2>
            <p>
              Choose the next interview time for {pendingInterview.position} at{" "}
              {pendingInterview.company}.
            </p>

            <form onSubmit={handleInterviewStatusSubmit} noValidate>
              <label>
                Interview date and time
                <input
                  type="datetime-local"
                  lang="en-US"
                  value={interviewDate}
                  onChange={(event) => {
                    setInterviewDate(event.target.value);
                    setInterviewDateError("");
                  }}
                  required
                />
              </label>

              {interviewDateError && (
                <p className="form-error" role="alert">
                  {interviewDateError}
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeInterviewModal}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  Save interview
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
