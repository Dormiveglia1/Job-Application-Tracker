import database from "../config/db.js";

export async function getDashboardSummary(request, response) {
  const userId = request.user.userId;

  try {
    const [
      [upcomingInterviewRows],
      [statusRows],
      [monthlyRows],
      [categoryRows],
      [conversionRows],
    ] = await Promise.all([
      database.execute(
        `SELECT id, company, position, interview_date
           FROM applications
           WHERE user_id = ?
             AND status = 'interview'
             AND interview_date IS NOT NULL
             AND interview_date >= NOW()
           ORDER BY interview_date ASC
           LIMIT 1`,
        [userId],
      ),
      database.execute(
        `SELECT status, COUNT(*) AS count
         FROM applications
         WHERE user_id = ? AND status != 'archived'
         GROUP BY status`,
        [userId],
      ),

      database.execute(
        `SELECT
          DATE_FORMAT(application_date, '%Y-%m') AS month,
          COUNT(*) AS count
         FROM applications
         WHERE user_id = ? AND status != 'archived'
         GROUP BY DATE_FORMAT(application_date, '%Y-%m')
         ORDER BY month ASC`,
        [userId],
      ),

      database.execute(
        `SELECT category, COUNT(*) AS count
         FROM applications
         WHERE user_id = ? AND status != 'archived'
         GROUP BY category
         ORDER BY count DESC, category ASC`,
        [userId],
      ),

      database.execute(
        `SELECT
          COUNT(*) AS totalApplications,
          SUM(interview_date IS NOT NULL) AS interviewedApplications
         FROM applications
         WHERE user_id = ? AND status != 'archived'`,
        [userId],
      ),
    ]);

    const statusCounts = Object.fromEntries(
      statusRows.map((row) => [row.status, row.count]),
    );

    const { totalApplications, interviewedApplications } = conversionRows[0];

    const interviewRate =
      totalApplications === 0
        ? 0
        : Math.round((interviewedApplications / totalApplications) * 100);

    return response.status(200).json({
      statusCounts,
      monthlyApplications: monthlyRows,
      categoryDistribution: categoryRows,
      interviewRate,
      nextInterview: upcomingInterviewRows[0] || null,
    });
  } catch (error) {
    console.error("Unable to get dashboard summary:", error.message);

    return response.status(500).json({
      message: "Unable to get dashboard summary.",
    });
  }
}
