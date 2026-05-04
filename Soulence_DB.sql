CREATE DATABASE IF NOT EXISTS soulence_db;
USE soulence_db;

-- 1. CREATE BASE TABLE FIRST (NO DEPENDENCIES)
CREATE TABLE accounts_tb (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  passkey VARCHAR(255) NOT NULL,
  account_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  account_status ENUM('Active','Inactive','Suspended','Pending') DEFAULT 'Active',
  last_login TIMESTAMP NULL
);

-- 2. PROFILES (LINKED TO ACCOUNT)
CREATE TABLE profiles_tb (
  profile_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Female','Male','LGBT','Prefer not to say') NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  preferred_gender ENUM('Female','Male','LGBT','All') NOT NULL,
  min_preferred_age INT DEFAULT 18,
  max_preferred_age INT DEFAULT 120,

  FOREIGN KEY (account_id) REFERENCES accounts_tb(user_id)
    ON DELETE CASCADE
);

-- 3. ACCOUNT RECOVERY
CREATE TABLE account_recovery_tb (
  recovery_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT NOT NULL,
  recovery_token VARCHAR(255) NOT NULL UNIQUE,
  token_type ENUM('PasswordReset','EmailVerification','TwoFactor') NOT NULL,
  is_used TINYINT(1) DEFAULT 0,
  expiry_date TIMESTAMP NOT NULL,

  FOREIGN KEY (account_id) REFERENCES accounts_tb(user_id)
    ON DELETE CASCADE
);

-- 4. MATCHES (ADD UNIQUE PAIR)
CREATE TABLE matches_tb (
  match_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_one BIGINT NOT NULL,
  user_two BIGINT NOT NULL,
  match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  match_status ENUM('Pending','Accepted','Rejected','Blocked') DEFAULT 'Pending',

  FOREIGN KEY (user_one) REFERENCES accounts_tb(user_id) ON DELETE CASCADE,
  FOREIGN KEY (user_two) REFERENCES accounts_tb(user_id) ON DELETE CASCADE,

  UNIQUE KEY unique_match (user_one, user_two)
);

-- 5. MESSAGES
CREATE TABLE messages_tb (
  message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  match_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  receiver_id BIGINT NOT NULL,
  message_text TEXT NOT NULL,

  FOREIGN KEY (match_id) REFERENCES matches_tb(match_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES accounts_tb(user_id),
  FOREIGN KEY (receiver_id) REFERENCES accounts_tb(user_id)
);