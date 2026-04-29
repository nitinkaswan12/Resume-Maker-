# CareerForge Pro - Resume Maker

Welcome to the **CareerForge Pro** repository! This is a full-stack web application designed to help users build their professional resumes seamlessly, and even assess their ATS (Applicant Tracking System) scores against specific job descriptions.

## Project Structure

This project is organized as a monorepo containing both the frontend and the backend:

-   [`careerforge-pro/`](./careerforge-pro/): The React.js frontend directory containing the UI for building resumes, previewing templates, and the user dashboard.
-   [`careerforge-backend/`](./careerforge-backend/): The Node.js/Express backend directory providing the API for authentication, resume management, payments, and AI integrations.

## Features

-   **Resume Builder Interface**: Easy to use form for filling in personal info, experience, education, and skills.
-   **Live Resume Preview**: Real-time preview of how your resume will look.
-   **ATS Keyword Scoring**: Extract and evaluate resume keywords against job descriptions using AI.
-   **User Authentication**: Sign-up and log-in to save your data securely.
-   **Dashboard**: View and manage all your saved resumes.

## How to Run Locally

### Prerequisites
- Node.js (v14 or above)
- MongoDB Database
- Ensure you have your environment variables set up properly (API keys for AI services, DB URI, Stripe keys if necessary).

### 1. Starting the Backend
```bash
cd careerforge-backend
npm install
npm run dev
```
By default, the backend will run on port `5000`.

### 2. Starting the Frontend
In a new terminal window:
```bash
cd careerforge-pro
npm install
npm start
```
By default, the frontend will be accessible at [http://localhost:3000](http://localhost:3000).
