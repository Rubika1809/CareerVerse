# CareerVerse – AI Placement Preparation Platform

A comprehensive full-stack web application designed to help engineering students prepare for campus placements through AI-powered resume analysis, mock interviews, timed aptitude tests, and company-specific preparation guides.

## 🌟 Key Features

- **Auth System**: Secure JWT-based authentication with Student & Admin roles.
- **Student Dashboard**: Personalized dashboard tracking placement readiness, recent activity, and upcoming tasks.
- **AI Resume Analyzer**: Parses resumes (PDF/DOCX) to extract skills, calculate an ATS score, and suggest improvements.
- **Mock Interview Simulator**: Timed interview environment with role-specific questions for top recruiters (TCS, Infosys, Accenture, Capgemini).
- **Aptitude Practice**: Timed multiple-choice quizzes across Quantitative, Logical, Verbal, and Programming categories with instant feedback.
- **Company Preparation Guides**: Detailed selection process, syllabus, and pro-tips for major IT companies.
- **Certificate Manager**: Upload and organize technical certifications.
- **Admin Dashboard**: Manage student accounts, view platform statistics, and configure question banks.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 (Vite)
- **Routing**: React Router v6
- **Styling**: Vanilla CSS3 (Custom Design System with Variables)
- **Icons**: React Icons (Material Design)
- **Charts/Visuals**: Recharts, React Circular Progressbar
- **Notifications**: React Toastify

### Backend (Prepared for Java 17+)
- **Framework**: Java Spring Boot 3.x
- **Architecture**: MVC (Model-View-Controller)
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT Tokens

---

## 🚀 Getting Started (Frontend Demo Mode)

The frontend is built with a robust `mockService` layer that simulates all backend interactions using `localStorage`. This allows you to run and demo the entire platform without setting up the Java backend or MySQL database.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Run
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

**Demo Credentials**:
- **Student**: `student@careerverse.com` / `student123`
- **Admin**: `admin@careerverse.com` / `admin123`

---

## 📂 Project Structure

```
careerverse/
├── frontend/                  # React Application
│   ├── src/
│   │   ├── assets/            # Images, SVGs
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context (Auth)
│   │   ├── data/              # Static data (Questions, Companies)
│   │   ├── layouts/           # Dashboard shell & sidebar
│   │   ├── pages/             # Route-level components
│   │   ├── services/          # API & Mock services
│   │   ├── App.jsx            # Routing configuration
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global Design System
│   └── package.json
│
├── backend/                   # Spring Boot Source Code
│   ├── src/main/java/com/careerverse/
│   │   ├── config/            # Security & JWT configuration
│   │   ├── controller/        # REST API endpoints
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── model/             # JPA Entities
│   │   ├── repository/        # Spring Data Repositories
│   │   └── service/           # Business logic
│   └── pom.xml
│
└── database/                  # SQL Scripts
    └── schema.sql             # Complete MySQL table definitions
```

## 🎨 UI/UX Design Principles
- **Corporate Aesthetic**: Inspired by LinkedIn and Microsoft products using a clean white background, `#2563EB` (Blue) primary accent, and `#F8FAFC` secondary backgrounds.
- **Glassmorphism & Shadows**: Subtle box-shadows and blur effects for depth.
- **Micro-interactions**: Hover states, smooth transitions, and pulse animations for critical UI elements like timers.
- **Responsive**: Fully responsive CSS Grid and Flexbox layouts for desktop, tablet, and mobile viewing.

---

*Built as a final year engineering project demonstrating proficiency in Modern Web Development, UI/UX Design, Object-Oriented Programming, and Full Stack Integration.*
