# ✅ Login Terminal Issue - FIXED

## 🔸 The Problem
The frontend was trying to connect to the backend on **port 50001**, but the backend was actually running on **port 5000**.

This caused:
- ❌ "Backend unreachable" error on login page
- ❌ Connection refused in terminal
- ❌ 404 errors when submitting login form

## ✅ Solution Applied
Updated the frontend configuration to use the correct port:

### Files Modified:
1. **`frontend/.env`** - Changed `VITE_BACKEND_URL=http://localhost:50001` → `http://localhost:5000`
2. **`frontend/vite.config.js`** - Changed fallback from `50001` → `5000`

## 🚀 How to Run Now

### Terminal 1: Start Backend
```powershell
cd ai-learning-assistant\backend
npm install
npm run dev
```
Expected output:
```
✅ Server is running on port 5000
📍 http://localhost:5000/
MongoDB Connected
```

### Terminal 2: Start Frontend
```powershell
cd ai-learning-assistant\frontend
npm install
npm run dev
```
Expected output:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Terminal 3: Open Browser
```
Navigate to: http://localhost:5173
```

## ✅ Login Flow (Should Work Now)

1. Frontend opens on `http://localhost:5173`
2. Redirects to login page (`/login`)
3. Backend health check: `http://localhost:5000/api/auth/health` ✅
4. Submit credentials → `POST http://localhost:5000/api/auth/login`
5. Backend validates user and returns token
6. Frontend redirects to dashboard ✅

## 🔍 Verify Connection in Terminal

### Health Check:
```powershell
curl http://localhost:5000/api/auth/health
```

Expected response:
```json
{
  "success": true,
  "message": "Backend is healthy",
  "timestamp": "2026-02-13T..."
}
```

### Test Login API:
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🛠️ If Still Getting Errors

### Error: "Port 5000 already in use"
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change backend PORT in .env:
# PORT=5001
```

### Error: "Backend unreachable"
1. Make sure backend is running: `npm run dev` in `backend/` folder
2. Check `.env` file has correct `PORT=5000`
3. Check frontend `.env` has `VITE_BACKEND_URL=http://localhost:5000`
4. Verify MongoDB is running (check for MongoDB service in Windows Services)

### Error: "Cannot GET /login"
- Make sure frontend is running: `npm run dev` in `frontend/` folder
- Clear browser cache: Ctrl+Shift+Delete in browser
- Hard refresh: Ctrl+Shift+R

## ✨ Summary
- ✅ Backend runs on **port 5000**
- ✅ Frontend runs on **port 5173**
- ✅ Frontend proxy forwards `/api/*` to `http://localhost:5000`
- ✅ Login should now work without terminal errors
