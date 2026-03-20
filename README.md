# Student ID Generator - Phase 3 Completion

A high-performance MERN stack application for generating, managing, and verifying student ID cards with rich UI/UX and advanced logic.

## 🚀 Phase 3 Features

### 🎨 UI/UX Refinement
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop views using Tailwind CSS.
- **Glassmorphism Design**: Modern aesthetic with backdrop blurs and subtle gradients.
- **Micro-animations**: Smooth transitions and hover effects using Framer Motion-inspired CSS.
- **Real-time Feedback**: Custom toast notifications and loading spinners for all operations.

### 🧠 Advanced Logic
- **Server-side Search & Pagination**: Optimized database queries to handle large student datasets.
- **Cloudinary Integration**: Secure and persistent cloud storage for student photos.
- **Bulk Import**: Seamless Excel (.xlsx) processing for large-scale student registration.
- **QR Code Generation**: Dynamic QR codes integrated into ID cards for instant verification.
- **PDF Generation**: High-quality PDF export for ID cards using `html2canvas` and `jsPDF`.

### 🛡️ Performance & Testing
- **Unit Testing**: Included basic unit tests for the Student model using Jest.
- **Query Optimization**: Implemented server-side filtering and indexing for fast data retrieval.

### 📝 Documentation
- **API Documentation**: Interactive Swagger documentation available at `/api-docs`.
- **System Logs**: Comprehensive server-side error logging for debugging.

## 🛠 Tech Stack

- **Frontend**: React 19 (Vite), Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary
- **Testing**: Jest, Supertest

## 🚀 Installation & Setup

1. **Install Dependencies**
   ```bash
   # Root
   npm run install-all
   ```

2. **Environment Configuration**
   Create `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```

3. **Run Application**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Once the server is running, visit:
`http://localhost:5000/api-docs`

---
© 2024 Institute ID System | Phase 3 Review Ready
