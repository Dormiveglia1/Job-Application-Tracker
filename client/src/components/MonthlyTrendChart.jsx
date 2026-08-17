function MonthlyTrendChart({ data }) {
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 46, left: 34 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxCount = Math.max(...data.map((item) => Number(item.count)), 1);

  const points = data.map((item, index) => {
    const x =
      padding.left +
      (data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
    const y =
      padding.top + chartHeight - (Number(item.count) / maxCount) * chartHeight;

    return { ...item, x, y };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = [
    `${points[0].x},${padding.top + chartHeight}`,
    linePoints,
    `${points.at(-1).x},${padding.top + chartHeight}`,
  ].join(" ");

  return (
    <div className="trend-chart" role="img" aria-label="Monthly application trend">
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        {[0, 0.5, 1].map((step) => {
          const y = padding.top + chartHeight - chartHeight * step;

          return (
            <g key={step}>
              <line
                className="trend-grid-line"
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <text className="trend-axis-label" x="0" y={y + 4}>
                {Math.round(maxCount * step)}
              </text>
            </g>
          );
        })}

        <polygon className="trend-area" points={areaPoints} />
        <polyline className="trend-line" points={linePoints} />

        {points.map((point) => (
          <g key={point.month}>
            <circle className="trend-point" cx={point.x} cy={point.y} r="5" />
            <text className="trend-value" x={point.x} y={point.y - 12}>
              {point.count}
            </text>
            <text
              className="trend-axis-label"
              x={point.x}
              y={height - 16}
              textAnchor="middle"
            >
              {point.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default MonthlyTrendChart;
