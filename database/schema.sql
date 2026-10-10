-- ============================================================================
-- NoticeNexus — Relational Database Schema
-- Database: noticenexus
-- Character Set: utf8mb4 (supports English, Telugu script, and Unicode)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `noticenexus`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `noticenexus`;

-- ----------------------------------------------------------------------------
-- Table 1: departments
-- Academic and administrative departments publishing notices
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `contact_email` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: users
-- Campus accounts with Role-Based Access Control (student, staff, admin)
-- Passwords stored strictly as bcrypt hashes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
  `department_id` INT NULL,
  `academic_year` VARCHAR(30) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: notices
-- Official campus announcements with source grounding and accessibility
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` ENUM('Examinations', 'Scholarships', 'Academics', 'Assignments', 'Placements', 'Events', 'Administration', 'General') NOT NULL DEFAULT 'General',
  `department_id` INT NOT NULL,
  `academic_year` VARCHAR(30) NOT NULL DEFAULT 'All Years',
  `content` TEXT NOT NULL,
  `source_url` VARCHAR(500) NOT NULL COMMENT 'Verified URL to original circular or PDF',
  `source_title` VARCHAR(255) NOT NULL COMMENT 'Official reference/circular number',
  `deadline` DATE NULL,
  `audience` VARCHAR(255) DEFAULT 'All Students',
  `required_documents` VARCHAR(500) DEFAULT 'Not specified in this notice',
  `action_items` VARCHAR(500) DEFAULT 'Review official source',
  `telugu_title` VARCHAR(255) NULL,
  `telugu_summary` TEXT NULL,
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `author_id` INT NOT NULL,
  `published_at` TIMESTAMP NULL,
  `is_development_sample` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = Sample mock data, 0 = Real official notice',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_notices_status` (`status`),
  INDEX `idx_notices_category` (`category`),
  INDEX `idx_notices_dept` (`department_id`),
  INDEX `idx_notices_deadline` (`deadline`),
  INDEX `idx_notices_published` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: notice_revisions
-- Audit trail tracking edits and official revisions made by staff
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notice_revisions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `notice_id` INT NOT NULL,
  `editor_id` INT NOT NULL,
  `revised_title` VARCHAR(255) NOT NULL,
  `revised_content` TEXT NOT NULL,
  `change_summary` VARCHAR(255) NOT NULL,
  `revised_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`notice_id`) REFERENCES `notices`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`editor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_revisions_notice` (`notice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: saved_notices
-- Student bookmarks saved to personal profile (persisted in MySQL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `saved_notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `notice_id` INT NOT NULL,
  `saved_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_notice` (`user_id`, `notice_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`notice_id`) REFERENCES `notices`(`id`) ON DELETE CASCADE,
  INDEX `idx_saved_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 6: reminders
-- Student personal deadlines and submission to-do items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `notice_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `due_date` DATE NULL,
  `is_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`notice_id`) REFERENCES `notices`(`id`) ON DELETE SET NULL,
  INDEX `idx_reminders_user` (`user_id`),
  INDEX `idx_reminders_due` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
