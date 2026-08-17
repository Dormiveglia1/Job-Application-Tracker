function StatusBadge({ status }) {
  const normalizedStatus = status.toLowerCase();

  return (
    <span className={`status-badge status-${normalizedStatus}`}>{status}</span>
  );
}

export default StatusBadge;
