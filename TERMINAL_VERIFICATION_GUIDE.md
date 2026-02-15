# Terminal Verification Guide - AI Credit Issue Fix

## Quick Verification (Run These Commands)

### 1. Check Backend is Running

```powershell
# Run this in a new terminal
curl http://localhost:5000/health
```

**Expected Output**:
```json
{"status":"ok","timestamp":"2024-XX-XX...","database":"connected"}
```

### 2. Check API Key is Loaded

```powershell
# Look for this in backend logs (Terminal 1)
# You should see:
# 🔑 ANTHROPIC_API_KEY present: true
# 🔑 API Key: sk-ant-api...c5wAA
```

### 3. Check AI Service Status

```powershell
curl http://localhost:5000/api/chat/status
```

**Expected Output (Before Credits Added)**:
```json
{
  "success": true,
  "aiStatus": {
    "available": true,
    "model": "claude-3-5-sonnet-20241022",
    "status": "ready"
  },
  "apiAvailable": true
}
```

**Note**: Status will show "ready" even if credits are exhausted (API will fail on actual request)

### 4. Test Chat Endpoint (Will Fail Until Credits Added)

```powershell
# This will return 503 error with helpful message until credits are added
curl -X POST http://localhost:5000/api/chat/test-document-id `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{"message":"What is this document about?"}'
```

**Expected Error (Until Credits Added)**:
```json
{
  "success": false,
  "message": "AI Service Temporarily Unavailable - The AI learning assistant is currently unavailable due to insufficient API credits...",
  "errorCode": "CREDITS_EXHAUSTED",
  "apiStatus": { ... }
}
```

---

## Test Educational Response (After Adding Credits)

### Step 1: After Adding API Credits

1. Update .env or add credits to existing key
2. Restart backend: `cd backend ; npm start`
3. Wait for "MongoDB Connected" message

### Step 2: Test Response Format

Send this test request:

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    message = "Explain what a database is in simple terms"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/chat/YOUR_DOCUMENT_ID" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### Step 3: Verify Response Quality

Expected response should contain:
- ✅ Simple explanation (not technical jargon)
- ✅ Key points (bulleted list)
- ✅ 2-3 real-world examples
- ✅ Explanation of WHY it matters

**Example Good Response**:
```
Database is like a well-organized filing cabinet for information.

Key Points:
- Stores information in organized tables (like Excel sheets)
- Finds information quickly (search through millions in seconds)
- Keeps data safe and organized
- Multiple people can use it at same time

Real Examples:
1. Your email service stores all emails in a database
2. Netflix uses databases to store movies and your watch history
3. Your school stores student records in a database

Why It Matters:
Databases let us organize huge amounts of information that computers can 
find instantly - imagine trying to find a specific paper in a filing cabinet 
manually vs. using a computer search!
```

---

## Verification Checklist

After implementing the fix, verify:

### Backend Logs Check:
- [ ] Server started on port 5000
- [ ] MongoDB Connected Successfully message appears
- [ ] ANTHROPIC_API_KEY present: true
- [ ] No errors in terminal

### Frontend Behavior:
- [ ] Page loads at http://localhost:5174
- [ ] Can log in successfully
- [ ] Can upload/view documents
- [ ] Chat tab is clickable
- [ ] Chat input field appears

### Error Handling:
- [ ] Trying to chat shows orange "Service Temporarily Unavailable" message
- [ ] Error message is user-friendly (not raw API error)
- [ ] No raw JSON in error display
- [ ] Error code shown as CREDITS_EXHAUSTED in network tab

### After Adding Credits:
- [ ] Chat sends/receives message
- [ ] Response is educational and beginner-friendly
- [ ] No "Service Temporarily Unavailable" error
- [ ] Response time < 10 seconds

---

## Browser Network Tab Testing

### Check Error Response:

1. Open DevTools (F12)
2. Go to Network tab
3. Click Chat input and send message
4. Look for POST `/api/chat/[documentId]`
5. Click that request
6. Go to Response tab

**Should Show** (before credits added):
```json
{
  "success": false,
  "message": "AI Service Temporarily Unavailable...",
  "errorCode": "CREDITS_EXHAUSTED"
}
```

**NOT**:
```json
{
  "type": "error",
  "error": {
    "message": "Your credit balance is too low..."
  }
}
```

---

## Debugging Steps if Issues Persist

### If Chat Still Shows Raw Error:

1. Check if browser cache is cleared:
   ```
   Ctrl + Shift + Delete → Clear All
   ```

2. Hard refresh page:
   ```
   Ctrl + F5 (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

3. Check frontend code updated:
   ```powershell
   # Check that Chat.jsx was modified
   Get-Content frontend/src/components/Chat.jsx | Select-String "CREDITS_EXHAUSTED"
   ```
   Should return something (not empty)

### If Backend Still Returns Old Error:

1. Verify changes were saved:
   ```powershell
   Get-Content backend/controllers/chatController.js | Select-String "CREDITS_EXHAUSTED"
   ```
   Should return something

2. Check .env file has API key:
   ```powershell
   Get-Content backend/.env | grep ANTHROPIC
   ```

3. Verify backend restarted:
   - Stop terminal (Ctrl+C)
   - Start again: `npm start`
   - Wait for "MongoDB Connected"

### If Credits Don't Work:

1. Verify API key format:
   - Should start with: `sk-ant-api`
   - Should be ~50+ characters long

2. Check Anthropic account:
   - Visit: https://console.anthropic.com/account/billing/overview
   - Verify credits > 0
   - Check payment method is valid

3. Try creating new key:
   - https://console.anthropic.com/account/keys
   - Create new key
   - Update .env with new key
   - Restart backend

---

## File Verification

### Check Modified Files Exist:

```powershell
# Check all modified files exist and have changes

# 1. Backend error handling
Select-String "CREDITS_EXHAUSTED" backend/controllers/chatController.js
# Should find the error code detection

# 2. Backend AI service
Select-String "credit balance" backend/services/aiService.js
# Should find the error message

# 3. Frontend error handling
Select-String "CREDITS_EXHAUSTED" frontend/src/components/Chat.jsx
# Should find the error code check
```

---

## Log Output Expectations

### Successful Chat Request (After Credits Added):

```
📤 Calling Claude API with 1 messages
✅ Anthropic Client initialized successfully
✅ Got response from Claude: Explain what a database...
✅ Chat processed in 2850ms
```

### Failed Chat Request (No Credits):

```
📤 Calling Claude API with 1 messages
❌ Claude API Error: Your credit balance is too low...
💳 API CREDITS EXHAUSTED - Returning helpful error message
✅ Error response sent to client
```

---

## Terminal Commands Summary

```powershell
# Stop all Node processes
Get-Process node | Stop-Process -Force

# Start backend (Terminal 1)
cd backend; npm start

# Start frontend (Terminal 2)
cd frontend; npm run dev

# Edit .env (add/update API key)
notepad backend/.env

# Check if API key is correct format
(Get-Content backend/.env | Select-String "ANTHROPIC_API_KEY").Line

# View recent backend logs
Get-Content backend/server.js | Select-String "ANTHROPIC_API_KEY"

# Restart just backend (Ctrl+C to stop, then)
npm start
```

---

## API Credit Restoration Checklist

### Option 1: Add Credits (Fast - 5 min)
- [ ] Go to https://console.anthropic.com/account/billing/overview
- [ ] Click "Purchase Credits"
- [ ] Select amount ($5-$100)
- [ ] Complete payment
- [ ] Refresh page - should see credits added
- [ ] No .env changes needed
- [ ] Restart backend to reload API key

### Option 2: New API Key (15 min)
- [ ] Go to https://console.anthropic.com/account/keys
- [ ] Create new key
- [ ] Open `backend/.env`
- [ ] Find line: `ANTHROPIC_API_KEY=sk-ant-api...`
- [ ] Replace with new key
- [ ] Save file (Ctrl+S)
- [ ] Restart backend

### Option 3: Different Account (30 min)
- [ ] Create new Anthropic account: https://console.anthropic.com
- [ ] Add payment method and credits
- [ ] Generate API key from new account
- [ ] Update .env in backend folder
- [ ] Restart backend

---

## Happy Path Testing

**Complete flow after fix**:

1. ✅ Backend started and MongoDB connected
2. ✅ Frontend loads at localhost:5174
3. ✅ User logs in successfully
4. ✅ User uploads PDF document
5. ✅ User clicks "Chat" tab
6. ✅ User types question in chat input
7. ✅ User clicks send/Enter
8. ✅ (Before credits) Shows "Service Temporarily Unavailable" with helpful message
9. ✅ (After credits added) Gets beginner-friendly educational response
10. ✅ Response explains topic simply with examples
11. ✅ User can ask follow-up questions
12. ✅ Chat history is saved
13. ✅ No errors in browser console

---

## Support Resources

- **Anthropic Docs**: https://docs.anthropic.com
- **Anthropic Console**: https://console.anthropic.com
- **API Billing**: https://console.anthropic.com/account/billing/overview
- **API Keys**: https://console.anthropic.com/account/keys
