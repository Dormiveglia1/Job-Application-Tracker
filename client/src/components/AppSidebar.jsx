import { NavLink, useNavigate } from "react-router-dom";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("careerflow_user"));
  } catch {
    return null;
  }
}

function AppSidebar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    localStorage.removeItem("careerflow_token");
    localStorage.removeItem("careerflow_user");

    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">C</span>
        <span>CareerFlow</span>
      </div>

      <nav aria-label="Main navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/applications"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Applications
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="current-user" title={user.email}>
            <span className="current-user-name">{user.name}</span>
            <span className="current-user-email">{user.email}</span>
          </div>
        )}

        <button type="button" className="logout-button" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default AppSidebar;
