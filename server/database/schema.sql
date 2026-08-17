USE careerflow;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_users_email UNIQUE (email)
);

SHOW CREATE TABLE users;


CREATE TABLE applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,

  company VARCHAR(150) NOT NULL,
  position VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  application_date DATE NOT NULL,

  status ENUM(
    'applied',
    'interview',
    'offer',
    'rejected',
    'withdrawn',
    'archived'
  ) NOT NULL DEFAULT 'applied',

  job_url VARCHAR(2048) NULL,
  application_source VARCHAR(100) NULL,
  location VARCHAR(150) NULL,
  salary VARCHAR(100) NULL,
  notes TEXT NULL,
  interview_date DATETIME NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_applications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  INDEX idx_applications_user_status (user_id, status),
  INDEX idx_applications_user_date (user_id, application_date),
  INDEX idx_applications_user_category (user_id, category)
);

SHOW CREATE TABLE applications;
SHOW INDEX FROM applications;

SELECT id, name, email, password_hash, created_at
FROM users;

