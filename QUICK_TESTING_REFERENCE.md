**QUICK REFERENCE - MERNAI TESTING CREDENTIALS & SETUP**

## 🔐 TEST CREDENTIALS

### Login #1 (Regular User)
```
Email:    test@example.com
Password: Test123456!
Role:     User
```

### Login #2 (Admin User)
```
Email:    admin@example.com
Password: Test123456!
Role:     Admin
```

---

## 📄 SAMPLE PDF

**File:** `backend/uploads/sample-document.pdf`
**Size:** 4,111 bytes
**Title:** "Machine Learning: A Complete Guide"
**Content:** Learning material covering:
- Introduction to Machine Learning
- Types: Supervised, Unsupervised, Reinforcement
- Applications in real-world
- Key algorithms

---

## 🚀 QUICK START

### 1. Verify Backend is Running
```bash
curl http://localhost:5000/health
# Expected: {"status":"ok"}
```

### 2. Login to Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456!"}'

# Save the token from response: "token":"eyJhbGci..."
```

### 3. Use Token for Protected Endpoints
```bash
TOKEN="your-token-from-login"

# Test protected endpoint
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 COMMON API ENDPOINTS

### Authentication
```
POST   /api/auth/login          - Login user
POST   /api/auth/signup         - Register user
GET    /api/auth/profile        - Get profile (protected)
```

### Documents
```
POST   /api/documents/upload    - Upload PDF (protected)
GET    /api/documents/list      - List documents (protected)
GET    /api/documents/:id       - Get document details (protected)
```

### Chat/AI
```
POST   /api/chat/query          - Send chat message (protected)
GET    /api/chat/history        - Get chat history (protected)
```

### Flashcards
```
POST   /api/flashcards/create-set  - Create set (protected)
POST   /api/flashcards/:id/add-card - Add card (protected)
GET    /api/flashcards          - List sets (protected)
```

### Quizzes
```
POST   /api/quizzes/create      - Create quiz (protected)
GET    /api/quizzes             - List quizzes (protected)
POST   /api/quizzes/:id/submit  - Submit answers (protected)
```

### Dashboard
```
GET    /api/dashboard/stats     - Get statistics (protected)
```

### Health
```
GET    /health                  - Basic health check
GET    /api/health              - API health check
GET    /api/health/detailed     - Detailed health info
```

---

## 💻 POSTMAN COLLECTION TEMPLATE

**Base URL:** `http://localhost:5000/api`

### Step 1: Login
**Method:** POST
**URL:** `{{base_url}}/auth/login`
**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "Test123456!"
}
```
**Response:** Copy the `token` value

### Step 2: Set Auth Header
**Header Name:** Authorization
**Header Value:** `Bearer {{token-from-login}}`

### Step 3: Test Endpoints
**Example:** GET `{{base_url}}/dashboard/stats`
**Header:** Authorization: Bearer {{your-token}}

---

## 🧪 TESTING CHECKLIST

### Health & Status
- [ ] GET /health → Status OK
- [ ] GET /api/health → Database connected
- [ ] GET /api/health/detailed → Full metrics

### Authentication
- [ ] POST /api/auth/login → Get token ✅
- [ ] GET /api/auth/profile → User details
- [ ] POST /api/auth/logout → Logout

### Documents
- [ ] POST /api/documents/upload → Upload sample-document.pdf
- [ ] GET /api/documents/list → View list
- [ ] GET /api/documents/:id → View details

### Chat/AI
- [ ] POST /api/chat/query → Ask "What is ML?"
- [ ] GET /api/chat/history → View conversation

### Flashcards
- [ ] POST /api/flashcards/create-set → Create "ML Basics"
- [ ] POST /api/flashcards/:id/add-card → Add question
- [ ] GET /api/flashcards → List sets

### Quizzes
- [ ] POST /api/quizzes/create → Create quiz
- [ ] GET /api/quizzes → List quizzes
- [ ] POST /api/quizzes/:id/submit → Submit answers

### Dashboard
- [ ] GET /api/dashboard/stats → Get stats

---

## 🔑 TOKEN FORMAT

After login, you'll receive:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Use the token in Authorization header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 EXPECTED RESPONSES

### Successful Login
```json
Status: 200 OK
{
  "success": true,
  "token": "...",
  "user": {
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Protected Route Without Token
```json
Status: 401 Unauthorized
{
  "message": "No authorization token provided"
}
```

### Health Check
```json
Status: 200 OK
{
  "status": "healthy",
  "database": "connected",
  "environment": "development"
}
```

### Dashboard Stats
```json
Status: 200 OK
{
  "overview": {
    "totalDocuments": 0,
    "totalFlashcards": 0,
    "totalQuizzes": 0,
    "completedQuizzes": 0,
    "averageQuizScore": 0
  }
}
```

---

## 🐛 IF SOMETHING FAILS

### "Invalid email/username or password"
✅ Check credentials:
- Email: `test@example.com`
- Password: `Test123456!`
- Make sure database was seeded: `node seed-database.js`

### "No authorization token provided"
✅ Add header to request:
```
Authorization: Bearer <token-from-login>
```

### "Cannot find module"
✅ Install dependencies:
```bash
npm install helmet morgan axios form-data pdfkit bcryptjs
```

### "ECONNREFUSED"
✅ Backend not running:
```bash
npm run dev
```

### "MongoDB connection failed"
✅ MongoDB not running:
```bash
# Windows
# Start MongoDB service or run mongod.exe
```

---

## ⚡ AUTOMATED TEST

Run comprehensive test:
```bash
cd backend
node comprehensive-test.js
```

This will automatically test all features!

---

## 📱 DATABASE SEEDING

If test users don't exist, run:
```bash
cd backend
node seed-database.js
```

Creates:
- test@example.com (User role)
- admin@example.com (Admin role)

Both with password: `Test123456!`

---

## 📄 SAMPLE PDF GENERATION

If PDF doesn't exist, generate it:
```bash
cd backend
node generate-sample-pdf.js
```

Creates: `uploads/sample-document.pdf`

---

## 🎯 TESTING WORKFLOW

1. **Verify Backend Running** ✅
   ```bash
   curl http://localhost:5000/health
   ```

2. **Login**
   ```bash
   POST /api/auth/login
   Email: test@example.com
   Password: Test123456!
   ```

3. **Get Token**
   - Copy token from response
   - Use in Authorization header

4. **Test Features**
   - Add `Authorization: Bearer {{token}}` header
   - Test any endpoint

---

## ✅ QUICK VALIDATION

### Backend Status
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"ok"}`

### Database Status
```bash
curl http://localhost:5000/api/health
```
Expected: `"database":"connected"`

### Full System Status
```bash
curl http://localhost:5000/api/health/detailed
```
Expected: Complete system metrics

---

**Last Updated:** February 14, 2026
**Status:** ✅ All Systems Ready for Testing
**Backend Version:** Production 1.0
