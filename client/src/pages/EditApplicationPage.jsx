import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppSidebar from "../components/AppSidebar";
import { apiRequest } from "../services/api";
import "../App.css";

const initialFormData = {
  company: "",
  position: "",
  category: "",
  applicationDate: "",
  status: "applied",
  jobUrl: "",
  applicationSource: "",
  location: "",
  salary: "",
  notes: "",
  interviewDate: "",
};

function EditApplicationPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplication() {
      try {
        const token = localStorage.getItem("careerflow_token");

        const data = await apiRequest(`/applications/${applicationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const application = data.application;

        setFormData({
          company: application.company || "",
          position: application.position || "",
          category: application.category || "",
          applicationDate: application.application_date?.slice(0, 10) || "",
          status: application.status || "applied",
          jobUrl: application.job_url || "",
          applicationSource: application.application_source || "",
          location: application.location || "",
          salary: application.salary || "",
          notes: application.notes || "",
          interviewDate: application.interview_date?.slice(0, 16) || "",
        });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [applicationId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      const token = localStorage.getItem("careerflow_token");

      await apiRequest(`/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      navigate("/applications");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="page-message">Loading application...</p>;
  }

  return (
    <div className="app-shell">
      <AppSidebar />

      <main className="page-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">APPLICATIONS</p>
            <h1>Edit application</h1>
            <p>Update the details of this job application.</p>
          </div>

          <Link to="/applications" className="secondary-button">
            Back to applications
          </Link>
        </header>

        <section className="form-card">
          {error && <p className="form-error">{error}</p>}

          <form className="application-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <label>
                Company
                <input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Position
                <input
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Job category
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="For example: Frontend"
                  required
                />
              </label>

              <label>
                Application date
                <input
                  type="date"
                  lang="en-US"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                  {formData.status === "archived" && (
                    <option value="archived" disabled>
                      Archived — restore from Applications
                    </option>
                  )}
                </select>
              </label>

              <label>
                Application source
                <input
                  name="applicationSource"
                  value={formData.applicationSource}
                  onChange={handleChange}
                  placeholder="For example: LinkedIn"
                />
              </label>

              {formData.status === "interview" && (
                <label>
                  Next interview date
                  <input
                    type="datetime-local"
                    lang="en-US"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleChange}
                    required
                  />
                </label>
              )}

              <label>
                Location
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="For example: Toronto, ON"
                />
              </label>

              <label>
                Salary
                <input
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="For example: $75,000–$90,000"
                />
              </label>

              <label className="full-width">
                Job posting link
                <input
                  type="url"
                  name="jobUrl"
                  value={formData.jobUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>

              <label className="full-width">
                Notes
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Add details, follow-up notes, or contact information."
                />
              </label>
            </div>

            <div className="form-actions">
              <Link to="/applications" className="secondary-button">
                Cancel
              </Link>

              <button
                className="primary-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default EditApplicationPage;
