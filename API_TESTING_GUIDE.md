# 🧪 API TESTING GUIDE

**Complete reference for testing all API endpoints with curl commands.**

---

## Setup

Ensure both servers are running:
- Backend: `npm run dev` (port 5000)
- Frontend: `npm run dev` (port 5173)

---

## Test 1: Backend Health Check

```bash
curl http://localhost:5000/api/health
```

**Expected Response (200):**
```json
{
  "status": "ok",
  "message": "Backend is running successfully",
  "timestamp": "2026-02-13T10:30:00Z"
}
```

---

## Test 2: Frontend Proxy Test

```bash
curl http://localhost:5173/api/health
```

**Expected Response (200):**
Same as above (proxied through Vite)

---

## Test 3: Sign Up New User

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "Test@1234",
    "confirmPassword": "Test@1234"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "student"
  }
}
```

---

## Test 4: Login with Test User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@1234"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "testuser@example.com",
    "role": "student"
  }
}
```

**Copy the token for next tests!**

---

## Test 5: Get User Profile (Protected)

```bash
# Replace TOKEN with actual token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile
```

**Expected Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "testuser@example.com",
    "fullName": "Test User",
    "role": "student",
    "isActive": true
  }
}
```

**Without Token (401):**
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

## Test 6: Verify Token

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": { ... }
}
```

---

## Test 7: Logout

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Test 8: Invalid Login Attempt

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## Test 9: Frontend API Request Through Proxy

```bash
# Via frontend proxy (http://localhost:5173)
curl http://localhost:5173/api/health
```

**Expected Response (200):**
```json
{
  "status": "ok",
  "message": "Backend is running successfully"
}
```

This confirms the Vite proxy is working correctly.

---

## Test 10: Error Handling - Missing Required Fields

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password is required"
  ]
}
```

---

## Test 11: Error Handling - Invalid Token

```bash
curl -H "Authorization: Bearer invalid.token.here" \
  http://localhost:5000/api/auth/profile
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## Test 12: Test Password Hashing

```bash
# After successful signup/login, check MongoDB directly
# Passwords should NEVER be stored in plain text

# In MongoDB shell:
db.users.findOne({ email: "testuser@example.com" })

# You should see:
{
  "_id": ObjectId("..."),
  "email": "testuser@example.com",
  "password": "$2a$10$...", // This is bcrypt hash, NOT plain text
  "username": "testuser",
  ...
}
```

✅ Password is bcrypt-hashed (starts with `$2a$10$`)

---

## PowerShell Script for Quick Testing

Save as `test-api.ps1`:

```powershell
# Test 1: Health Check
$health = curl http://localhost:5000/api/health | ConvertFrom-Json
Write-Host "✅ Backend Health: $($health.status)"

# Test 2: Login
$login = curl -Method POST http://localhost:5000/api/auth/login `
  -ContentType application/json `
  -Body '{"email":"testuser@example.com","password":"Test@1234"}' | ConvertFrom-Json

$token = $login.token
Write-Host "✅ Login Token: $($token.substring(0, 20))..."

# Test 3: Get Profile
$profile = curl -Headers @{"Authorization"="Bearer $token"} `
  http://localhost:5000/api/auth/profile | ConvertFrom-Json

Write-Host "✅ Authenticated User: $($profile.user.email)"

# Test 4: Frontend Proxy
$proxy = curl http://localhost:5173/api/health | ConvertFrom-Json
Write-Host "✅ Frontend Proxy: $($proxy.status)"

Write-Host ""
Write-Host "🎉 ALL TESTS PASSED!"
```

Run with:
```powershell
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

---

## Bash Script for Quick Testing (macOS/Linux)

Save as `test-api.sh`:

```bash
#!/bin/bash

# Test 1: Health Check
echo "Testing backend health..."
health=$(curl -s http://localhost:5000/api/health)
echo "✅ $health"

# Test 2: Login
echo ""
echo "Logging in..."
login=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Test@1234"}')
token=$(echo $login | jq -r '.token')
echo "✅ Got token: ${token:0:20}..."

# Test 3: Get Profile
echo ""
echo "Getting authenticated profile..."
profile=$(curl -s -H "Authorization: Bearer $token" \
  http://localhost:5000/api/auth/profile)
echo "✅ $profile"

# Test 4: Frontend Proxy
echo ""
echo "Testing frontend proxy..."
proxy=$(curl -s http://localhost:5173/api/health)
echo "✅ $proxy"

echo ""
echo "🎉 ALL TESTS PASSED!"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login, profile fetch |
| 201 | Created | New user registration |
| 400 | Bad Request | Missing fields, invalid format |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Invalid endpoint |
| 500 | Server Error | Backend crash or database error |

---

## Expected Token Format

JWT tokens have 3 parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  .  eyJpZCI6IjEyMzQiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ  .  TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
└─ HEADER ─┘                              └─ PAYLOAD ─┘                                                   └─ SIGNATURE ─┘
```

To decode (online tool: jwt.io):
- Header: Algorithm & type
- Payload: User ID, email, expiration
- Signature: Server signature (cannot be tampered with)

---

## Troubleshooting API Calls

### Error: "Cannot GET /api/health"
- Backend not running on port 5000
- Solution: Start backend with `npm run dev`

### Error: "Invalid token"
- Token expired or tampered with
- Solution: Login again to get new token

### Error: "ECONNREFUSED"
- Frontend cannot reach backend
- Solution: Check backend is running, verify proxy config

### Error: "CORS error"
- Backend CORS settings blocking requests
- Solution: Check `vite.config.js` proxy configuration

---

## Next Steps

1. **API Testing**: Use these commands to verify backend works
2. **Frontend Testing**: Open http://localhost:5173 and test UI
3. **Database Testing**: Verify users are created with hashed passwords
4. **Error Testing**: Try invalid inputs to verify error handling

