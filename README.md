# IEC Connect

## 📌 Project Overview
IEC Connect is a web-based platform designed to digitize and streamline the workflow of an Institutional Ethics Committee (IEC). It enables efficient proposal submission, reviewer management, role-based access, and decision tracking in a centralized system. The platform replaces manual processes with a secure, transparent, and efficient digital workflow.

## 🚀 Key Features
- Role-Based Access Control (RBAC)
- Proposal Submission & Tracking
- Reviewer Assignment
- Feedback & Decision System
- Secure Authentication (JWT)
- Dashboards for different roles
- Status updates & notifications

## 🧠 Core Concept: Role-Based Access Control (RBAC)
RBAC ensures that users can only access features based on their role.

### 🔑 Roles
- Admin: Manage users, assign reviewers, final decision making
- Reviewer: Review assigned proposals, provide feedback, recommend approval/rejection
- Researcher: Submit proposals, track status, respond to feedback
- Scrutiny Member: Verify documents and perform initial validation

### ⚙️ How RBAC Works
- User is assigned a role during registration
- Middleware checks role on every request
- Unauthorized access is blocked
- Protected routes ensure security

## 🏗️ Architecture
Frontend (React) ⇄ Backend (Node.js + Express) ⇄ Database (MongoDB)

## 🛠️ Tech Stack
Frontend: React.js, HTML5, CSS3, JavaScript (ES6+), Axios  
Backend: Node.js, Express.js  
Database: MongoDB  
Authentication: JSON Web Token (JWT)  
Testing: Playwright (End-to-End Testing)

## 📂 Project Structure
IEC-Connect/
│── client/          # Frontend  
│── server/          # Backend  
│── routes/          # API routes  
│── controllers/     # Business logic  
│── models/          # Database schemas  
│── middleware/      # Auth & RBAC  
│── tests/           # Playwright tests  
│── package.json  
│── README.md  

## ⚙️ Setup Instructions

### 🔹 Prerequisites
- Node.js
- MongoDB (local or Atlas)
- Git

### 🔹 Clone Project
git clone <your-repo-link>  
cd IEC-Connect  

### 🔹 Backend Setup
cd server  
npm install  

Create a `.env` file:
PORT=5000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
JWT_REFRESH_SECRET=your_refresh_secret_key
EMAIL_USER=your_smtp_account
EMAIL_PASS=your_smtp_app_password
APP_URL=http://localhost:5173

Run backend:
npm start  

### 🔹 Frontend Setup
cd client  
npm install  
npm run dev

## 🔐 Authentication Flow
1. User registers/logs in  
2. Server generates JWT token  
3. Token is stored in frontend  
4. Token sent with every request  
5. Backend validates token and role  

## 🔄 Workflow
1. Researcher submits; researcher and admin receive email and in-app notification.
2. Admin approves and forwards to SRC; assigned SRC members are notified.
3. SRC approves and returns the proposal to admin for reviewer appointment.
4. Admin assigns one or more reviewers; each selected reviewer is notified.
5. Reviewers submit individual recommendations; after all assigned reviewers respond, admin is notified to make the final decision.
6. Admin approves or rejects. Approval notifies the researcher; rejection is recorded and sent back for researcher revision and resubmission.

## 🧪 Testing
Run server tests from the `server` directory with `npm test`.
Check the client from the `client` directory with `npm run lint` and `npm run build`.

## 📍 Proposal Tracking API
- `GET /api/tracking/proposals/:id` returns the current status, timeline, reviewer progress, and final decision.
- `POST /api/tracking/proposals/:id/assign-reviewers` accepts `{ "reviewerIds": ["..."] }` from an admin after SRC approval.
- `POST /api/tracking/proposals/:id/reviews` accepts `{ "recommendation": "approve | request_revision | reject", "comments": "..." }` from an assigned reviewer.
- `POST /api/tracking/proposals/:id/final-decision` accepts `{ "decision": "approved | rejected", "reason": "..." }` from an admin after all assigned reviewers respond.

Proposal status transitions are kept in an append-only `statusHistory`. Reviewer recommendations are stored per reviewer and review cycle; resubmissions start a new cycle without deleting previous records. Email delivery requires the `EMAIL_USER`, `EMAIL_PASS`, and `APP_URL` environment variables; notification and workflow writes continue if email delivery is unavailable.

## 📈 Future Scope
- AI-based proposal analysis  
- Automated reviewer recommendation  
- Email & SMS notifications  
- Advanced analytics dashboard  
- Mobile application  

## 🤝 Contributors
- Team of 4 members (Final Year Project)

## 📜 License
This project is developed for academic purposes.

## 💡 Conclusion
IEC Connect provides a scalable and secure solution for managing ethics committee workflows digitally. With RBAC and modern web technologies, it ensures efficiency, transparency, and ease of use.
