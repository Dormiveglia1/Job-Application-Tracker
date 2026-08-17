USE careerflow;

ALTER TABLE applications
ADD COLUMN application_source VARCHAR(100) NULL
AFTER job_url;

DESCRIBE applications;
