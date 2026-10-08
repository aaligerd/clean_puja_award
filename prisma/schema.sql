-- ==========================================================
-- Clean Puja Award – MySQL Database Schema
-- Bengali-only Puja Committee Registration & Cleanliness Portal
-- ==========================================================

-- 1. Committees Table
CREATE TABLE IF NOT EXISTS `committees` (
  `id` VARCHAR(36) NOT NULL,
  `committee_name` VARCHAR(150) NOT NULL,
  `pujo_name` VARCHAR(150) NOT NULL,
  `area` VARCHAR(150) NOT NULL,
  `address` VARCHAR(300) NOT NULL,
  `ward_no` INT NOT NULL, -- KMC Ward No (1–144)
  `contact_number` VARCHAR(15) NOT NULL, -- 10-digit Indian Mobile
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `must_change_password` BOOLEAN NOT NULL DEFAULT TRUE,
  `status` ENUM('REGISTERED', 'SHORTLISTED', 'WINNER', 'REJECTED') NOT NULL DEFAULT 'REGISTERED',
  `score` FLOAT NULL,
  `admin_notes` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `committees_email_unique` (`email`),
  INDEX `committees_ward_no_idx` (`ward_no`),
  INDEX `committees_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Images Table
CREATE TABLE IF NOT EXISTS `images` (
  `id` VARCHAR(36) NOT NULL,
  `committee_id` VARCHAR(36) NOT NULL,
  `phase` ENUM('DURING', 'AFTER') NOT NULL,
  `s3_key` VARCHAR(512) NOT NULL,
  `thumb_key` VARCHAR(512) NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `size_bytes` INT NOT NULL,
  `mime_type` VARCHAR(50) NULL,
  `taken_at` DATETIME(3) NULL, -- EXIF photo date
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `images_committee_phase_idx` (`committee_id`, `phase`),
  CONSTRAINT `fk_images_committee` FOREIGN KEY (`committee_id`) 
    REFERENCES `committees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Dynamic App Settings & Timelines
CREATE TABLE IF NOT EXISTS `settings` (
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Admins & Jury Members
CREATE TABLE IF NOT EXISTS `admins` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NULL,
  `role` ENUM('SUPER_ADMIN', 'ADMIN', 'JURY') NOT NULL DEFAULT 'ADMIN',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `admins_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Email Logs & Retries
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` VARCHAR(36) NOT NULL,
  `committee_id` VARCHAR(36) NULL,
  `type` ENUM('REGISTRATION_CREDENTIALS', 'PASSWORD_RESET', 'DEADLINE_REMINDER', 'CUSTOM_NOTICE') NOT NULL,
  `recipient_email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NULL,
  `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `error_message` TEXT NULL,
  `retry_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `email_logs_committee_id_idx` (`committee_id`),
  INDEX `email_logs_recipient_email_idx` (`recipient_email`),
  INDEX `email_logs_status_idx` (`status`),
  CONSTRAINT `fk_email_logs_committee` FOREIGN KEY (`committee_id`) 
    REFERENCES `committees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Password Reset Tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `used` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `password_reset_tokens_token_unique` (`token`),
  INDEX `password_reset_tokens_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
