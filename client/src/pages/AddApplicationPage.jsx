import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import "../App.css";
import AppSidebar from "../components/AppSidebar";

const initialFormValues = {
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

function AddApplicationPage() {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState(initialFormValues);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("careerflow_token");

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await apiRequest("/applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formValues,
          interviewDate:
            formValues.status === "interview"
              ? formValues.interviewDate
              : undefined,
        }),
      });

      navigate("/applications");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <AppSidebar />

      <div className="page-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">APPLICATIONS</p>
            <h1>Add application</h1>
          </div>
        </header>

        <main className="dashboard">
          <form className="application-form" onSubmit={handleSubmit} noValidate>
            {errorMessage && (
              <p className="form-error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="form-grid">
              <label className="form-field">
                Company
                <input
                  name="company"
                  value={formValues.company}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                Position
                <input
                  name="position"
                  value={formValues.position}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                Category
                <input
                  name="category"
                  value={formValues.category}
                  onChange={handleChange}
                  placeholder="Frontend, Data, Product..."
                  required
                />
              </label>

              <label className="form-field">
                Application date
                <input
                  type="date"
                  lang="en-US"
                  name="applicationDate"
                  value={formValues.applicationDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="form-field">
                Status
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </label>

              {formValues.status === "interview" && (
                <label className="form-field">
                  Interview date
                  <input
                    type="datetime-local"
                    lang="en-US"
                    name="interviewDate"
                    value={formValues.interviewDate}
                    onChange={handleChange}
                    required
                  />
                </label>
              )}

              <label className="form-field">
                Location
                <input
                  name="location"
                  value={formValues.location}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field">
                Salary
                <input
                  name="salary"
                  value={formValues.salary}
                  onChange={handleChange}
                  placeholder="$90k-$110k"
                />
              </label>
              <label className="form-field">
                Application source
                <input
                  name="applicationSource"
                  value={formValues.applicationSource}
                  onChange={handleChange}
                  placeholder="LinkedIn, school website..."
                />
              </label>
              <label className="form-field form-field-full">
                Job URL
                <input
                  type="url"
                  name="jobUrl"
                  value={formValues.jobUrl}
                  onChange={handleChange}
                />
              </label>

              <label className="form-field form-field-full">
                Notes
                <textarea
                  name="notes"
                  value={formValues.notes}
                  onChange={handleChange}
                  rows="5"
                />
              </label>
            </div>

            <div className="form-actions">
              <Link className="secondary-link" to="/applications">
                Cancel
              </Link>

              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save application"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddApplicationPage;
