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
1. Researcher submits proposal  
2. Scrutiny verifies documents  
3. Admin assigns reviewers  
4. Reviewers evaluate proposal  
5. Admin makes final decision  
6. Researcher gets notified  

## 🧪 Testing
Run server tests from the `server` directory with `npm test`.
Check the client from the `client` directory with `npm run lint` and `npm run build`.

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
