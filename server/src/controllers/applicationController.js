import database from "../config/db.js";

const validStatuses = new Set([
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
  "archived",
]);

function normalizeJobUrl(jobUrl) {
  if (!jobUrl || typeof jobUrl !== "string" || !jobUrl.trim()) {
    return null;
  }

  const urlWithProtocol = /^https?:\/\//i.test(jobUrl.trim())
    ? jobUrl.trim()
    : `https://${jobUrl.trim()}`;

  const parsedUrl = new URL(urlWithProtocol);

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error("Job URL must use http or https.");
  }

  return parsedUrl.href;
}

export async function getApplications(request, response) {
  const {
    status,
    category,
    search,
    sortBy = "applicationDate",
    order = "desc",
    page = "1",
    limit = "10",
    includeArchived = "false",
  } = request.query;

  const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
  const offset = (pageNumber - 1) * pageSize;

  const sortColumns = {
    applicationDate: "application_date",
    createdAt: "created_at",
    company: "company",
  };

  const sortColumn = sortColumns[sortBy] || sortColumns.applicationDate;
  const sortDirection = order === "asc" ? "ASC" : "DESC";

  const conditions = ["user_id = ?"];
  const values = [request.user.userId];

  if (status) {
    if (!validStatuses.has(status)) {
      return response.status(400).json({
        message: "Invalid application status.",
      });
    }

    conditions.push("status = ?");
    values.push(status);
  } else if (includeArchived !== "true") {
    conditions.push("status != ?");
    values.push("archived");
  }

  if (category) {
    conditions.push("category = ?");
    values.push(category);
  }

  if (search) {
    conditions.push("(company LIKE ? OR position LIKE ?)");
    const searchTerm = `%${search.trim()}%`;
    values.push(searchTerm, searchTerm);
  }

  const whereClause = conditions.join(" AND ");

  try {
    const [countRows] = await database.execute(
      `SELECT COUNT(*) AS total
       FROM applications
       WHERE ${whereClause}`,
      values,
    );

    const [applications] = await database.execute(
      `SELECT
        id,
        company,
        position,
        category,
        application_date,
        status,
        job_url,
        application_source,
        location,
        salary,
        notes,
        interview_date,
        created_at,
        updated_at
      FROM applications
      WHERE ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}, id DESC
      LIMIT ${pageSize} OFFSET ${offset}`,
      values,
    );

    const total = countRows[0].total;

    return response.status(200).json({
      applications,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Unable to get applications:", error.message);

    return response.status(500).json({
      message: "Unable to get applications.",
    });
  }
}

export async function createApplication(request, response) {
  const {
    company,
    position,
    category,
    applicationDate,
    status = "applied",
    jobUrl,
    applicationSource,
    location,
    salary,
    notes,
    interviewDate,
  } = request.body;

  if (!company || !position || !category || !applicationDate) {
    return response.status(400).json({
      message:
        "Company, position, category, and application date are required.",
    });
  }

  if (!validStatuses.has(status)) {
    return response.status(400).json({
      message: "Invalid application status.",
    });
  }

  if (status === "interview" && !interviewDate) {
    return response.status(400).json({
      message: "An interview date is required for interview status.",
    });
  }

  let normalizedJobUrl;

  try {
    normalizedJobUrl = normalizeJobUrl(jobUrl);
  } catch {
    return response.status(400).json({
      message: "Please enter a valid job URL.",
    });
  }

  try {
    const [result] = await database.execute(
      `INSERT INTO applications (
        user_id,
        company,
        position,
        category,
        application_date,
        status,
        job_url,
        application_source,
        location,
        salary,
        notes,
        interview_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request.user.userId,
        company.trim(),
        position.trim(),
        category.trim(),
        applicationDate,
        status,
        normalizedJobUrl,
        applicationSource?.trim() || null,
        location?.trim() || null,
        salary?.trim() || null,
        notes?.trim() || null,
        interviewDate || null,
      ],
    );

    return response.status(201).json({
      message: "Application created successfully.",
      application: {
        id: result.insertId,
        company: company.trim(),
        position: position.trim(),
        category: category.trim(),
        applicationDate,
        status,
      },
    });
  } catch (error) {
    console.error("Unable to create application:", error.message);

    return response.status(500).json({
      message: "Unable to create application.",
    });
  }
}

export async function updateApplicationStatus(request, response) {
  const applicationId = Number.parseInt(request.params.applicationId, 10);
  const { status, interviewDate } = request.body;

  if (!Number.isInteger(applicationId) || applicationId < 1) {
    return response.status(400).json({
      message: "Invalid application ID.",
    });
  }

  if (!validStatuses.has(status)) {
    return response.status(400).json({
      message: "Invalid application status.",
    });
  }

  if (status === "interview" && !interviewDate) {
    return response.status(400).json({
      message: "An interview date is required for interview status.",
    });
  }

  try {
    const query =
      status === "interview"
        ? `UPDATE applications
           SET status = ?, interview_date = ?
           WHERE id = ? AND user_id = ?`
        : `UPDATE applications
           SET status = ?
           WHERE id = ? AND user_id = ?`;

    const values =
      status === "interview"
        ? [status, interviewDate, applicationId, request.user.userId]
        : [status, applicationId, request.user.userId];

    const [result] = await database.execute(query, values);

    if (result.affectedRows === 0) {
      return response.status(404).json({
        message: "Application not found.",
      });
    }

    return response.status(200).json({
      message: "Application status updated successfully.",
      application: {
        id: applicationId,
        status,
        interviewDate: status === "interview" ? interviewDate : undefined,
      },
    });
  } catch (error) {
    console.error("Unable to update application status:", error.message);

    return response.status(500).json({
      message: "Unable to update application status.",
    });
  }
}

export async function getApplicationById(request, response) {
  const applicationId = Number(request.params.applicationId);

  if (!Number.isInteger(applicationId) || applicationId < 1) {
    return response.status(400).json({ message: "Invalid application ID." });
  }

  try {
    const [applications] = await database.execute(
      `SELECT
        id,
        company,
        position,
        category,
        application_date,
        status,
        job_url,
        application_source,
        location,
        salary,
        notes,
        interview_date,
        created_at,
        updated_at
      FROM applications
      WHERE id = ? AND user_id = ?`,
      [applicationId, request.user.userId],
    );

    if (applications.length === 0) {
      return response.status(404).json({ message: "Application not found." });
    }

    return response.json({ application: applications[0] });
  } catch (error) {
    console.error("Unable to get application:", error.message);
    return response.status(500).json({ message: "Unable to get application." });
  }
}

export async function updateApplication(request, response) {
  const applicationId = Number(request.params.applicationId);

  const {
    company,
    position,
    category,
    applicationDate,
    status,
    jobUrl,
    applicationSource,
    location,
    salary,
    notes,
    interviewDate,
  } = request.body;

  if (!Number.isInteger(applicationId) || applicationId < 1) {
    return response.status(400).json({ message: "Invalid application ID." });
  }

  if (!company || !position || !category || !applicationDate || !status) {
    return response.status(400).json({
      message:
        "Company, position, category, application date, and status are required.",
    });
  }

  if (!validStatuses.has(status)) {
    return response
      .status(400)
      .json({ message: "Invalid application status." });
  }

  if (status === "interview" && !interviewDate) {
    return response.status(400).json({
      message: "An interview date is required for interview applications.",
    });
  }

  let normalizedJobUrl;

  try {
    normalizedJobUrl = normalizeJobUrl(jobUrl);
  } catch {
    return response.status(400).json({
      message: "Please enter a valid job URL.",
    });
  }

  try {
    const baseValues = [
      company.trim(),
      position.trim(),
      category.trim(),
      applicationDate,
      status,
      normalizedJobUrl,
      applicationSource || null,
      location || null,
      salary || null,
      notes || null,
    ];

    let query = `
      UPDATE applications
      SET
        company = ?,
        position = ?,
        category = ?,
        application_date = ?,
        status = ?,
        job_url = ?,
        application_source = ?,
        location = ?,
        salary = ?,
        notes = ?
    `;

    if (status === "interview") {
      query += ", interview_date = ?";
      baseValues.push(interviewDate);
    }

    query += " WHERE id = ? AND user_id = ?";
    baseValues.push(applicationId, request.user.userId);

    const [result] = await database.execute(query, baseValues);

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Application not found." });
    }

    return response.json({ message: "Application updated successfully." });
  } catch (error) {
    console.error("Unable to update application:", error.message);
    return response
      .status(500)
      .json({ message: "Unable to update application." });
  }
}

export async function deleteApplication(request, response) {
  const applicationId = Number(request.params.applicationId);

  if (!Number.isInteger(applicationId) || applicationId < 1) {
    return response.status(400).json({ message: "Invalid application ID." });
  }

  try {
    const [result] = await database.execute(
      "DELETE FROM applications WHERE id = ? AND user_id = ?",
      [applicationId, request.user.userId],
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Application not found." });
    }

    return response.status(204).send();
  } catch (error) {
    console.error("Unable to delete application:", error.message);
    return response
      .status(500)
      .json({ message: "Unable to delete application." });
  }
}
