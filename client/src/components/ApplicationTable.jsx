import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import "./ApplicationTable.css";

function normalizeJobUrl(jobUrl) {
  if (!jobUrl?.trim()) {
    return null;
  }

  const urlWithProtocol = /^https?:\/\//i.test(jobUrl)
    ? jobUrl
    : `https://${jobUrl}`;

  try {
    const parsedUrl = new URL(urlWithProtocol);

    return ["http:", "https:"].includes(parsedUrl.protocol)
      ? parsedUrl.href
      : null;
  } catch {
    return null;
  }
}

function JobLink({ jobUrl }) {
  const href = normalizeJobUrl(jobUrl);

  if (!href) {
    return "—";
  }

  return (
    <a className="job-link" href={href} target="_blank" rel="noreferrer">
      Open
    </a>
  );
}

function ApplicationTable({
  applications,
  onArchiveToggle,
  onDelete,
  onStatusChange,
}) {
  if (applications.length === 0) {
    return <p className="empty-state">No applications found.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table applications-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Position</th>
            <th>Category</th>
            <th>Source</th>
            <th>Posting</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>{application.company}</td>
              <td>{application.position}</td>
              <td>{application.category}</td>
              <td>{application.application_source || "—"}</td>
              <td>
                <JobLink jobUrl={application.job_url} />
              </td>
              <td>
                <div className="status-control">
                  <StatusBadge status={application.status} />

                  <select
                    value={application.status}
                    aria-label={`Change status for ${application.company}`}
                    onChange={(event) =>
                      onStatusChange(application, event.target.value)
                    }
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              </td>
              <td>
                {new Date(application.application_date).toLocaleDateString(
                  "en-US",
                )}
              </td>
              <td className="table-actions">
                <Link
                  className="table-action-link"
                  to={`/applications/${application.id}/edit`}
                >
                  Edit
                </Link>

                <button
                  className={
                    application.status === "archived"
                      ? "table-restore-button"
                      : "table-archive-button"
                  }
                  type="button"
                  onClick={() => onArchiveToggle(application)}
                >
                  {application.status === "archived" ? "Restore" : "Archive"}
                </button>

                <button
                  className="table-delete-button"
                  type="button"
                  onClick={() => onDelete(application)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ApplicationTable;
