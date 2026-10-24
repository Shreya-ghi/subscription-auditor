# Smart Subscription & Recurring Expense Auditor

## 1. Project Introduction

The Smart Subscription & Recurring Expense Auditor is a web application
that helps users manage recurring expenses and track subscription payments
in one place.

It helps users organize subscriptions, monitor recurring costs, and
understand their spending more easily.

## 2. Project Objectives

- Manage recurring subscriptions in one place.
- Track subscription costs and billing details.
- Monitor recurring expenses.
- Provide a simple and user-friendly dashboard.
- Use DevOps practices to test and build the application automatically.

## 3. Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

### DevOps and Version Control
- Git
- GitHub
- Jenkins
- Pytest
- npm

## 4. Project Structure

```text
subscription-auditor/
├── backend/
│   ├── tests/
│   └── application files
├── frontend/
│   ├── src/
│   └── package.json
├── Jenkinsfile
├── README.md
└── .gitignore

## 5. How to Run the Project Locally

### Prerequisites
- Python 3
- Node.js and npm
- Git

### Backend Setup

1. Open a terminal in the project root.
2. Create and activate a Python virtual environment.
3. Install the backend dependencies:

```bash
pip install -r backend/requirements.txt
```

4. Configure the required environment variables, including `DATABASE_URL` and `ALLOWED_ORIGINS`, according to the backend configuration.
5. Start the FastAPI server from the project root:

```bash
uvicorn app.main:app --reload --app-dir backend
```

6. Open the API documentation at `http://127.0.0.1:8000/docs`.

### Frontend Setup

1. Open a second terminal.
2. Navigate to the frontend folder:

```bash
cd frontend
npm install
```

3. Configure `VITE_API_BASE_URL` to point to the backend URL.
4. Start the development server:

```bash
npm run dev
```

5. Open the local URL displayed in the terminal.

## 6. Git and GitHub Workflow

The project source code and version history are maintained using Git and GitHub.

Repository: https://github.com/Shreya-ghi/subscription-auditor

Common Git commands used:

```bash
git status
git add .
git commit -m "Describe the change"
git push origin main
git log --oneline
```

Meaningful changes are recorded as separate commits to maintain a clear development history.

## 7. Website Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

Live website: https://subscription-auditor-eight.vercel.app

Backend API documentation: https://subscription-auditor.onrender.com/docs

## 8. DevOps Tool Integration — Jenkins

Jenkins is integrated with the project to automate testing and frontend validation through a CI pipeline.

The pipeline includes the following stages:

1. Checkout source code from GitHub.
2. Run backend tests using Pytest.
3. Install frontend dependencies.
4. Run frontend lint checks.
5. Run frontend tests.
6. Build the frontend production bundle.

The pipeline helps identify errors early and verifies that the project can be built successfully after code changes.

## 9. Changes Made and Commit History

The project was developed incrementally using Git and GitHub. Each meaningful change was recorded as a separate commit.

| No. | Change Description | Commit Hash |
|---|---|---|
| 1 | Built and optimized the frontend | `b9af420` |
| 2 | Integrated the subscription backend and API | `6b9e09a` |
| 3 | Added the Jenkins CI pipeline | `c93e384` |
| 4 | Configured the Python path for Jenkins | `1603d2b` |
| 5 | Updated README and Jenkins CI documentation | `6a1abc8` |
| 6 | Expanded frontend tests and integrated them into Jenkins CI | `c86442e` |
| 7 | Prepared the application for deployment | `50d04fa` |
| 8 | Expanded setup and deployment instructions in README | `29cb97c` |

All commit hashes can be verified in the [GitHub commit history](https://github.com/Shreya-ghi/subscription-auditor/commits/main/).

## 10. Screenshot Evidence

Add your own screenshots with short captions to demonstrate the project and its DevOps workflow.

| Screenshot | Description |
|---|---|
| `evidence/dashboard.png` | Deployed website dashboard |
| `evidence/subscriptions.png` | Subscription list and management |
| `evidence/github-commits.png` | GitHub repository and commit history |
| `evidence/jenkins-success.png` | Successful Jenkins pipeline |
| `evidence/tests.png` | Backend and frontend test results |
| `evidence/api-docs.png` | FastAPI Swagger documentation |

Use screenshots captured from your own project. Ensure that the image paths match the actual files committed to the repository.

## 11. Conclusion

The Smart Subscription & Recurring Expense Auditor demonstrates website development, Git/GitHub version control, automated testing, Jenkins CI integration, and deployment of a frontend and backend application.
