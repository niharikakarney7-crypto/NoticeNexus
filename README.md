# NoticeNexus — Intelligent Campus Information Network

> **Tagline:** Every Notice. One Trusted Place.  
> **Architecture:** Single Unified Web Application (Frontend + Express API + MySQL)  
> **Theme:** 60% White (`#FFFFFF`), 20% Dark Navy (`#18213A`), 12% Magenta Plum (`#A02F76`), 8% Violet (`#4824E8`)

---

## 1. Project Overview

Students in higher education frequently miss important academic announcements, scholarship windows, and examination schedules because notices are fragmented across WhatsApp groups, PDF circulars, department bulletin boards, and college sub-pages.

**NoticeNexus** provides a centralized, official, and accessible campus information network:
* **100% Source-Grounded**: Every circular links back to its verified original official document or institutional URL.
* **Notice-to-Action Assistant**: Explicitly surfaces *Target Audience*, *Submission Deadline*, *Required Documents*, and *Immediate Next Actions* (safeguarded with *"Not specified in this notice"* when missing).
* **Universal Accessibility**: Browser-based Text-to-Speech (TTS) and authentic Telugu language translations with audio playback.
* **Deadlines & Study Reminders**: Personalized student study reminders and bookmarked circulars persisted directly in MySQL.
* **Role-Based Governance**: Strict server-enforced access control allowing only authorized faculty and administrators to author, publish, or archive notices.

---

## 2. Technology Stack & Single-Website URL Architecture

NoticeNexus adheres strictly to a **single unified public web application** served from one domain and port (`http://localhost:3000` locally, or `https://your-domain.com` in production):
* **Frontend**: HTML5, CSS3 Custom Properties (Design Tokens), Vanilla JavaScript (no bloated client framework).
* **Backend**: Node.js & Express.js.
* **Database**: MySQL 8.0 with `utf8mb4` Unicode support for Telugu scripts.
* **Security**: Password hashing with `bcryptjs`, stateless session security with `jsonwebtoken`, and anti-brute-force rate limiting.

### Clean Internal Routes (All under one host):
* `GET /` — Public Landing Page
* `GET /student` — Student Dashboard, Search, Category Pills, and Reminders
* `GET /notice/:id` — Deep Notice Detail, Source Verification, and Telugu TTS
* `GET /login` — Unified Portal Login (Staff, Admin, Students)
* `GET /admin` — Staff & Admin Console (Create, Publish, Archive Circulars)
* `GET /api/health` — Full-Stack & MySQL Health Check Diagnostic

---

## 3. Database Schema

The relational database **`noticenexus`** contains 6 normalized tables:

1. **`departments`**: Academic units (`CSE`, `ECE`, `EXAM_CELL`, `SCHOLARSHIP`, `TPO`, `ADMIN`).
2. **`users`**: Campus accounts with roles (`student`, `staff`, `admin`) and bcrypt hashed passwords.
3. **`notices`**: Official announcements with grounding metadata, deadlines, and `is_development_sample` flag.
4. **`notice_revisions`**: Audit trail recording every edit made by staff members.
5. **`saved_notices`**: Student bookmarks linked to user IDs in MySQL.
6. **`reminders`**: Student personal deadlines with completion toggles and overdue status.

---

## 4. Quick Start & Setup Instructions

### Prerequisites
* **Node.js**: v18+ (Tested on v24.21.0)
* **MySQL Server**: v8.0+ running locally on port 3306
* **Git**: Installed

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd NoticeNexus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your MySQL password:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=noticenexus
   JWT_SECRET=your_secret_jwt_key
   ```

4. **Initialize Database Schema & Development Seed Data:**
   Run the UTF-8 database initializer:
   ```bash
   node server/config/initDb.js
   ```

5. **Start the Unified Server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 5. Development Demo Accounts

For testing, the database is pre-seeded with these accounts:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | Full access: create, edit, archive, delete notices |
| **Staff** | `staff_exam` | `Staff@123` | Staff Console: create, publish, and archive circulars |
| **Student** | `student_demo` | `Student@123` | Student Portal: view notices, sync bookmarks, create reminders |

---

## 6. Automated Testing

NoticeNexus includes an automated end-to-end test suite testing all 5 modules across the full stack:
```bash
npm test
```
**Test Coverage (100% Passing)**:
* Health check & static page routing
* Notice retrieval, category filtering, search, and Telugu Unicode presence
* Login rate limiting, invalid credential rejection, and JWT verification
* Role guards (Students blocked from `/api/notices/manage` with `403 Forbidden`)
* Staff notice publication and revision tracking
* Student bookmark and study reminder persistence in MySQL

---

## 7. License & Credits

Built as part of the **NoticeNexus Intelligent Campus Information Network** project.
