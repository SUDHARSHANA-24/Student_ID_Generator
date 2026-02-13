# Student ID Generator

A MERN stack application for generating and managing student ID cards.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcryptjs

## Features

- **Admin Dashboard**: Manage students and generate ID cards.
- **Bulk Upload**: Upload student data via Excel/CSV.
- **ID Card Generation**: Generate and download ID cards as PDF.
- **Responsive Design**: Modern UI with a clean aesthetic.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-ID-generator
   ```

2. **Install Dependencies**
   ```bash
   npm run install-all
   ```
   Or manually:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the Application**
   From the root directory:
   ```bash
   npm start
   ```
   This will run both backend (port 5000) and frontend (port 5173 usually) concurrently.

## Folder Structure

- \`backend/\`: Node.js/Express API and Database models.
- \`frontend/\`: React application with Tailwind CSS.

## License

ISC
