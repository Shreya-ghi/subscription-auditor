# Smart Subscription & Recurring Expense Auditor

[![CI Pipeline](https://img.shields.io/badge/Jenkins-CI%20Passing-brightgreen?logo=jenkins)](https://github.com/Shreya-ghi/subscription-auditor)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel%20Live-black?logo=vercel)](https://subscription-auditor-eight.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render%20Live-46E3B7?logo=render)](https://subscription-auditor.onrender.com/docs)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=postgresql)](https://neon.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An automated, full-stack expense auditing web application developed for tracking recurring subscriptions, forecasting annual run-rates, alerting upcoming renewal deadlines, and detecting potential duplicate services. Designed with end-to-end DevOps automation including automated linting, comprehensive unit/component testing, declarative Jenkins CI pipelines, and decoupled cloud deployments.

---

## Quick Links

- **GitHub Repository:** [https://github.com/Shreya-ghi/subscription-auditor](https://github.com/Shreya-ghi/subscription-auditor)
- **Live Production Website:** [https://subscription-auditor-eight.vercel.app](https://subscription-auditor-eight.vercel.app)
- **Interactive Backend API Documentation (Swagger UI):** [https://subscription-auditor.onrender.com/docs](https://subscription-auditor.onrender.com/docs)
- **API Health Check:** [https://subscription-auditor.onrender.com/health](https://subscription-auditor.onrender.com/health)
- **Commit History:** [https://github.com/Shreya-ghi/subscription-auditor/commits/main](https://github.com/Shreya-ghi/subscription-auditor/commits/main)

---

## Table of Contents

1. [Project Introduction](#1-project-introduction)
2. [Project Objectives](#2-project-objectives)
3. [Technologies Used](#3-technologies-used)
4. [Project Structure](#4-project-structure)
5. [How to Run the Project Locally](#5-how-to-run-the-project-locally)
6. [Git and GitHub Workflow](#6-git-and-github-workflow)
7. [Website Deployment](#7-website-deployment)
8. [DevOps Tool Integration — Jenkins CI](#8-devops-tool-integration--jenkins-ci)
9. [Changes Made and Commit History](#9-changes-made-and-commit-history)
10. [Screenshot Evidence](#10-screenshot-evidence)
11. [Conclusion](#11-conclusion)

---

## 1. Project Introduction

The **Smart Subscription & Recurring Expense Auditor** solves the problem of "subscription fatigue" and forgotten recurring commitments. Modern consumers and teams manage multiple software subscriptions (streaming, SaaS tools, cloud infrastructure, productivity apps) where small monthly charges often slip past unnoticed.

This platform centralizes recurring subscriptions into a responsive financial cockpit that automatically:
- Converts diverse billing cadences (Monthly, Quarterly, Yearly) into unified monthly and annual commitments.
- Audits immediate cash-flow requirements with 7-day and 30-day renewal countdown indicators.
- Flags underutilized or duplicate subscriptions to prevent unnecessary charges.
- Operates in both local development environments (zero-config SQLite) and production cloud environments (serverless PostgreSQL).

Built as an academic DevOps engineering submission (ISE2 DevOps), the project demonstrates complete software lifecycle management: modular code architecture, strict input validation, automated multi-stage CI pipelines, and zero-downtime production deployments.

---

## 2. Project Objectives

- **Unified Expense Management:** Provide full CRUD (Create, Read, Update, Delete) capability for subscriptions with normalized amounts, categories, billing cycles, and next renewal dates.
- **Financial Run-Rate Calculations:** Dynamically calculate aggregate monthly recurring expenses, 12-month projected outlooks, and category distribution percentages.
- **Proactive Renewal Auditing:** Automatically surface subscriptions due within 7 days with high-visibility badge alerts to avoid unexpected auto-debits.
- **Automated Quality Assurance:** Implement robust automated testing across both backend (Pytest, HTTPX) and frontend (Vitest, React Testing Library, Oxlint).
- **Continuous Integration Pipeline:** Enforce quality gates using a declarative Jenkins CI pipeline that builds and tests every change automatically before deployment.
- **Secure Cloud Deployment:** Deploy a production-ready decoupled architecture with environment variable configuration, secure CORS policies, and persistent PostgreSQL storage without exposing credentials.

---

## 3. Technologies Used

### Frontend Architecture
- **React 19:** Modern functional UI component architecture with hooks for reactive state management.
- **Vite 8:** High-performance frontend build engine and development server with Rollup chunk splitting.
- **Tailwind CSS 4:** Modern CSS framework for responsive layouts, cards, modals, and badges.
- **Recharts:** Interactive SVG-based data visualization library for dynamic expense breakdown donut charts.
- **Lucide React:** Clean icon set for visual metrics, actions, and status indicators.
- **Vitest & React Testing Library:** Unit and component testing framework with DOM assertions via `@testing-library/jest-dom`.
- **Oxlint:** High-speed JavaScript/JSX linter enforcing clean code standards.

### Backend Architecture
- **Python 3.13:** Core backend programming language.
- **FastAPI:** High-performance ASGI framework featuring automatic OpenAPI/Swagger documentation and type annotations.
- **Uvicorn (standard):** Production-grade ASGI web server with event loop optimization.
- **SQLAlchemy 2.0+:** Enterprise-grade Object Relational Mapper (ORM) providing database-agnostic abstractions.
- **SQLite:** Lightweight, file-based local database engine (`backend/subscriptions.db`) for rapid local development without server setup.
- **PostgreSQL & psycopg2-binary:** Enterprise-grade cloud relational database driver deployed on Neon Serverless PostgreSQL.
- **Pydantic:** Strict request and response payload schema validation.
- **python-dotenv:** Safe local environment variable loading for development credentials.
- **Pytest:** Automated backend test suite utilizing isolated in-memory test databases.

### DevOps, Version Control & Cloud Hosting
- **Git:** Distributed version control managing branching, commits, and tags.
- **GitHub:** Remote repository hosting with commit history tracking and deployment webhooks.
- **Jenkins:** CI automation server running automated test suites, linting, and production builds.
- **Vercel:** Cloud frontend hosting providing automatic Git deployments and global Edge CDN distribution.
- **Render:** Cloud containerized platform hosting the FastAPI ASGI web application.
- **Neon:** Serverless cloud PostgreSQL database with automated provisioning and encrypted connections.

---

## 4. Project Structure

The project follows a clean separation of concerns with isolated backend, frontend, and DevOps configurations:

```text
subscription-auditor/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── subscriptions.py       # REST API endpoints (GET, POST, PUT, DELETE)
│   │   ├── __init__.py
│   │   ├── database.py                # Database connection, engine, and URL resolution
│   │   ├── main.py                    # FastAPI app, CORS middleware, lifespan handler
│   │   ├── models.py                  # SQLAlchemy Subscription database model
│   │   └── schemas.py                 # Pydantic validation schemas
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                # Pytest fixtures and isolated test DB session
│   │   ├── test_main.py               # Root and /health availability tests
│   │   └── test_subscriptions.py      # CRUD, validation, and boundary tests (18 tests)
│   ├── pytest.ini                     # Pytest configuration settings
│   ├── requirements.txt               # Backend Python dependencies
│   └── subscriptions.db               # Local development SQLite database (git-ignored)
├── frontend/
│   ├── public/                        # Static web assets and favicons
│   ├── src/
│   │   ├── assets/                    # React icons and SVGs
│   │   ├── components/                # Modular UI components
│   │   │   ├── DeleteConfirmModal.jsx # Deletion confirmation dialog
│   │   │   ├── DeleteConfirmModal.test.jsx
│   │   │   ├── SummaryCards.jsx       # Metric cards for monthly/annual totals
│   │   │   ├── SummaryCards.test.jsx
│   │   │   ├── SubscriptionFormModal.jsx # Add / Edit subscription dialog
│   │   │   └── SubscriptionTable.jsx  # Paginated and filtered subscription list
│   │   ├── services/
│   │   │   └── api.js                 # Centralized API service with dynamic base URL
│   │   ├── test/
│   │   │   └── setup.js               # Jest-DOM matchers initialization for Vitest
│   │   ├── utils/
│   │   │   ├── calculations.js        # Financial calculations & renewal utilities
│   │   │   └── calculations.test.js   # 39 unit tests for calculations logic
│   │   ├── App.css                    # Component style rules
│   │   ├── App.jsx                    # Primary stateful application controller
│   │   ├── index.css                  # Tailwind CSS import directives
│   │   └── main.jsx                   # React root entry point
│   ├── .oxlintrc.json                 # Linter configuration
│   ├── index.html                     # Application HTML entry document
│   ├── package.json                   # NPM dependencies and execution scripts
│   └── vite.config.js                 # Vite bundling and Vitest configuration
├── evidence/                          # Screenshot documentation for academic submission
├── Jenkinsfile                        # Declarative Jenkins CI pipeline definition
├── .gitignore                         # Git exclusion rules (.env, .venv, *.db, dist)
└── README.md                          # Project documentation
```

---

## 5. How to Run the Project Locally

Follow these steps to set up and run the application on your local workstation.

### Prerequisites
- **Python:** Version 3.10 or higher
- **Node.js:** Version 18 or higher (with `npm`)
- **Git:** Version 2.30 or higher

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Shreya-ghi/subscription-auditor.git
cd subscription-auditor
```

---

### Step 2: Set Up and Run the Backend

1. **Create and activate a Python virtual environment:**

   On Windows (PowerShell):
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   On macOS / Linux:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. **Install backend dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Database Configuration:**
   - **Default (Zero-Config SQLite):** If no environment variables are defined, the application automatically creates and uses `backend/subscriptions.db`.
   - **Optional (PostgreSQL / Neon):** To use PostgreSQL locally, create `backend/.env` (which is ignored by Git):
     ```env
     DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
     ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
     ```

4. **Start the FastAPI backend server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. **Verify the backend:**
   - API Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
   - Interactive Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Step 3: Set Up and Run the Frontend

1. **Open a new terminal window and navigate to the `frontend` directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **API Base URL Configuration:**
   - By default, [`frontend/src/services/api.js`](frontend/src/services/api.js) automatically connects to `http://127.0.0.1:8000`.
   - To explicitly override, create `frontend/.env`:
     ```env
     VITE_API_BASE_URL=http://127.0.0.1:8000
     ```

4. **Start the Vite development server:**
   ```bash
   npm run dev
   ```

5. **Open the web application:**
   - Open your browser at [http://localhost:5173](http://localhost:5173)

---

### Step 4: Run Automated Tests Locally

#### Backend Tests (18 tests)
Run the isolated Pytest suite from the project root:
```powershell
.\.venv\Scripts\python.exe -m pytest backend\tests -v
```

#### Frontend Tests (47 tests)
Run the Vitest suite from the `frontend` directory:
```bash
npm --prefix frontend run test:run
```

#### Frontend Code Quality & Linting
Run Oxlint across all JavaScript/JSX source files:
```bash
npm --prefix frontend run lint
```

#### Frontend Production Build
Validate production bundling and chunk generation:
```bash
npm --prefix frontend run build
```

---

## 6. Git and GitHub Workflow

The project follows professional Git standards to maintain clean version history:

- **Branching Strategy:** Work is developed on feature branches and merged into the primary `main` branch.
- **Conventional Commit Messages:** Commit titles follow standardized conventions:
  - `feat:` for new capabilities and features.
  - `fix:` for bug fixes and path adjustments.
  - `ci:` for pipeline and Jenkins configurations.
  - `test:` for expanding unit and integration test suites.
  - `docs:` for documentation and evidence updates.
- **Security & Secret Hygiene:**
  - Sensitive files (`.env`, `backend/.env`) are strictly ignored via `.gitignore`.
  - Local database files (`backend/subscriptions.db`, `*.db`) are ignored to prevent local data leakage.
  - Python virtual environments (`.venv/`) and build outputs (`dist/`, `node_modules/`) are never committed.
  - No database passwords, API keys, or tokens exist in Git history.

Repository remote link: [https://github.com/Shreya-ghi/subscription-auditor](https://github.com/Shreya-ghi/subscription-auditor)

---

## 7. Website Deployment

The application uses a decoupled cloud architecture designed for scalability, zero downtime, and separation of static assets from API computation:

```
+--------------------------------------+       +-------------------------------------+
|           Vercel (Frontend)          |       |         Render (Backend API)        |
|  https://subscription-auditor-eight  | ----> |  https://subscription-auditor       |
|  .vercel.app                         | (REST)|  .onrender.com                      |
+--------------------------------------+       +------------------+------------------+
                                                                  |
                                                                  | SQLAlchemy 2.0+
                                                                  | (psycopg2-binary)
                                                                  v
                                               +-------------------------------------+
                                               |      Neon Serverless PostgreSQL     |
                                               |      (Encrypted SSL Database)       |
                                               +-------------------------------------+
```

### 1. Frontend Deployment (Vercel)
- **Service:** Vercel Static Hosting & Edge CDN
- **Live URL:** [https://subscription-auditor-eight.vercel.app](https://subscription-auditor-eight.vercel.app)
- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:**
  - `VITE_API_BASE_URL`: `https://subscription-auditor.onrender.com`

### 2. Backend Deployment (Render)
- **Service:** Render Web Service (Python Environment)
- **Live URL:** [https://subscription-auditor.onrender.com](https://subscription-auditor.onrender.com)
- **API Docs:** [https://subscription-auditor.onrender.com/docs](https://subscription-auditor.onrender.com/docs)
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables (set in Render dashboard — never committed to Git):**
  - `DATABASE_URL`: Neon PostgreSQL connection string
  - `ALLOWED_ORIGINS`: `https://subscription-auditor-eight.vercel.app,http://localhost:5173`

### 3. Database Cloud Persistence (Neon)
- **Service:** Neon Serverless PostgreSQL
- **Driver:** `psycopg2-binary>=2.9.9`
- **URL Normalization:** [`backend/app/database.py`](backend/app/database.py) automatically converts `postgres://` and `postgresql://` connection strings into `postgresql+psycopg2://` for guaranteed driver compatibility under SQLAlchemy 2.0.
- **Automatic Schema Initialization:** On startup, FastAPI's `lifespan` handler safely executes `Base.metadata.create_all(bind=engine)` using `CREATE TABLE IF NOT EXISTS`, ensuring non-destructive table provisioning without data loss.

---

## 8. DevOps Tool Integration — Jenkins CI

The project uses a declarative Jenkins pipeline defined in [`Jenkinsfile`](Jenkinsfile) that runs on an automated CI agent. The pipeline enforces five automated quality gates:

```
+--------------+     +--------------+     +--------------+     +--------------+     +--------------+
|   Checkout   | --> |Backend Tests | --> |Frontend Lint | --> |Frontend Tests| --> |Frontend Build|
|  (Git SCM)   |     |  (18 passed) |     |   (Oxlint)   |     |  (47 passed) |     | (Vite build) |
+--------------+     +--------------+     +--------------+     +--------------+     +--------------+
```

### Pipeline Stages Breakdown

1. **Stage 1: Checkout**
   - Checks out the latest commit from the repository using `checkout scm`.
   - Ensures an isolated, reproducible workspace for every build execution.

2. **Stage 2: Backend Tests**
   - Runs: `python -m pytest backend\tests -v`
   - Executes all 18 backend unit and API integration tests.
   - Uses an isolated temporary SQLite database defined in [`backend/tests/conftest.py`](backend/tests/conftest.py) to ensure tests never touch real data.
   - Validates CRUD operations, empty table scenarios, 404 error handling, price boundaries, and invalid billing cycle rejections.

3. **Stage 3: Frontend Lint**
   - Navigates to the `frontend/` directory.
   - Runs `npm ci` for clean, deterministic dependency installation.
   - Runs `npm run lint` (Oxlint) to catch potential runtime bugs, unhandled variables, and syntax errors across all components.

4. **Stage 4: Frontend Tests**
   - Runs `npm run test:run` (Vitest).
   - Executes 47 automated frontend tests across calculation utilities and React components.
   - Validates mathematical conversions, annual outlook calculations, 7-day upcoming renewal filters, duplicate detection, and modal interactions.

5. **Stage 5: Frontend Build**
   - Runs `npm run build` (Vite).
   - Compiles React JSX components, optimizes CSS via Tailwind, and creates production-ready bundles with Rollup chunk splitting.
   - Confirms that the application is ready for zero-downtime static deployment.

### Failure Handling
If any stage fails (e.g., a failing test or syntax error), the pipeline immediately aborts, preventing broken builds from progressing and notifying the team via Jenkins build logs.

---

## 9. Changes Made and Commit History

Below is the verified commit history from the Git repository demonstrating the iterative engineering and DevOps progression:

| Commit Hash | Date | Commit Message | Key Changes & DevOps Impact |
| :--- | :--- | :--- | :--- |
| [`50d04fa`](https://github.com/Shreya-ghi/subscription-auditor/commit/50d04fa) | 2026-10-24 | `feat: prepare subscription auditor for deployment` | Implemented dynamic `DATABASE_URL` and `ALLOWED_ORIGINS` resolution, added Neon PostgreSQL support with `psycopg2-binary`, and added deployment verification evidence. |
| [`c86442e`](https://github.com/Shreya-ghi/subscription-auditor/commit/c86442e) | 2026-10-22 | `test(frontend): expand unit and component tests and integrate into Jenkins CI` | Expanded frontend automated tests from 7 to 47 passing tests, added React component tests, and integrated the `Frontend Tests` stage into `Jenkinsfile`. |
| [`6a1abc8`](https://github.com/Shreya-ghi/subscription-auditor/commit/6a1abc8) | 2026-10-20 | `docs: update project README and Jenkins CI documentation` | Added comprehensive architecture documentation, setup commands, and Jenkins CI integration descriptions. |
| [`1603d2b`](https://github.com/Shreya-ghi/subscription-auditor/commit/1603d2b) | 2026-10-20 | `fix: configure Python path for Jenkins` | Configured absolute Python virtual environment executable path for Windows Jenkins agent execution. |
| [`c93e384`](https://github.com/Shreya-ghi/subscription-auditor/commit/c93e384) | 2026-10-20 | `ci: add Jenkins pipeline` | Created initial declarative `Jenkinsfile` orchestrating checkout, Pytest execution, Oxlint verification, and production bundling. |
| [`6b9e09a`](https://github.com/Shreya-ghi/subscription-auditor/commit/6b9e09a) | 2026-10-20 | `feat: integrate subscription backend and API` | Built FastAPI REST backend, SQLAlchemy data models, Pydantic validation schemas, and local SQLite persistence. |
| [`59aa8d0`](https://github.com/Shreya-ghi/subscription-auditor/commit/59aa8d0) | 2026-10-18 | `Merge GitHub repository history` | Synchronized remote GitHub repository commits with local project repository. |
| [`b9af420`](https://github.com/Shreya-ghi/subscription-auditor/commit/b9af420) | 2026-10-18 | `Build and optimize subscription auditor frontend` | Implemented React dashboard, Tailwind CSS components, Recharts visualizations, and Vite production bundle splitting. |
| [`debb179`](https://github.com/Shreya-ghi/subscription-auditor/commit/debb179) | 2026-10-11 | `Initial commit` | Initialized repository with project documentation structure and initial requirements. |

Full commit history: [https://github.com/Shreya-ghi/subscription-auditor/commits/main](https://github.com/Shreya-ghi/subscription-auditor/commits/main)

---

## 10. Screenshot Evidence

All screenshots are stored in the [`evidence/`](evidence/) directory and document key stages of testing, building, deployment, and live execution.

### A. Live Cloud Deployment Evidence

#### 1. Live Production Dashboard (Vercel)
The live production web application running on Vercel, connected to the cloud backend and Neon PostgreSQL database, showing active subscriptions, monthly run-rate metrics, and expense distribution charts.

![Live Production Application Dashboard](evidence/Screenshot%20(218).png)

#### 2. Vercel Production Deployment Overview
Vercel project overview dashboard confirming production deployment status `Ready` for domain `subscription-auditor-eight.vercel.app`, built from the `main` branch at commit `50d04fa`.

![Vercel Production Deployment Dashboard](evidence/Screenshot%20(213).png)

#### 3. Vercel Deployment Success Notification
Confirmation screen on Vercel displaying successful initial deployment and edge preview generation.

![Vercel Initial Deployment Success](evidence/Screenshot%20(212).png)

#### 4. Render Web Service Deployment (Backend API)
Render deployment console showing `Deploy succeeded | Live` for `https://subscription-auditor.onrender.com`, running Uvicorn with dynamic `$PORT` binding.

![Render Web Service Live Deployment](evidence/Screenshot%20(217).png)

---

### B. Jenkins Continuous Integration Evidence

#### 5. Jenkins CI Project Dashboard
Jenkins dashboard for the `SubscriptionAuditor-CI` pipeline showing consecutive successful builds and green build status markers.

![Jenkins CI Dashboard](evidence/Screenshot%20(179).png)

#### 6. Jenkins Console Output — Backend Tests & Frontend Lint
Jenkins console log showing all 18 backend Pytest tests passing, followed by clean frontend dependency installation and Oxlint execution.

![Jenkins Console - Tests and Lint](evidence/Screenshot%20(180).png)

#### 7. Jenkins Console Output — Production Build Success
Jenkins console log demonstrating Vite production bundle compilation, chunk size output, and the final `All CI stages passed! Finished: SUCCESS` message.

![Jenkins Console - Build Success](evidence/Screenshot%20(181).png)

#### 8. Jenkins Console Output — Build #3 Verification
Subsequent successful build (#3) confirming pipeline reliability across incremental commits.

![Jenkins Console - Build #3](evidence/Screenshot%20(185).png)

#### 9. Jenkins Console Output — Build #4 Verification
Build #4 confirming clean execution following the frontend test expansion.

![Jenkins Console - Build #4](evidence/Screenshot%20(189).png)

---

### C. Application Interface & Local Development Evidence

#### 10. Local Development Overview Dashboard
The application running locally on `http://localhost:5173`, connected to the local FastAPI server and SQLite database at `http://127.0.0.1:8000`.

![Local Development Dashboard](evidence/Screenshot%20(184).png)

#### 11. Metric Summary Cards
Close-up view of the real-time financial audit cards displaying monthly recurring commitments, annual projected outlook, active subscription counts, and upcoming renewal alerts.

![Summary Cards Detail](evidence/Screenshot%202026-10-20%20203757.png)

#### 12. Subscription Portfolio & Management Table
Close-up view of the subscription management table showing service names, categories, billing cycle prices, next renewal countdown badges, and action controls.

![Subscription Portfolio Detail](evidence/Screenshot%202026-10-20%20203811.png)

---

## 11. Conclusion

The **Smart Subscription & Recurring Expense Auditor** demonstrates a complete, production-grade DevOps lifecycle applied to a full-stack financial audit tool:

1. **Robust Engineering:** Built on React 19, Vite 8, FastAPI, and SQLAlchemy 2.0+ with full support for both zero-config local SQLite development and scalable cloud PostgreSQL persistence.
2. **Quality Gates:** Protected by 65 automated tests (18 backend, 47 frontend) and static code linting.
3. **Automated CI Pipeline:** Managed via Jenkins declarative pipelines, validating every commit before deployment.
4. **Reliable Cloud Deployment:** Fully deployed and active across Vercel, Render, and Neon with zero exposed credentials and secure CORS policies.

This repository serves as complete, verifiable evidence for the ISE2 DevOps practical examination.
