# ⚡ QUICK START (5-MINUTE SETUP)

**For users who just want to get the app running immediately.**

---

## Prerequisites ✅

- [✓] Node.js installed (from nodejs.org)
- [✓] MongoDB running (`mongod` or MongoDB service)
- [✓] Project extracted and ready

---

## STEP 1: Start Backend (Terminal 1)

```bash
cd ai-learning-assistant/backend
npm install  # First time only
npm run dev
```

**Wait for:**
```
✅ SERVER STARTED SUCCESSFULLY
```

---

## STEP 2: Start Frontend (Terminal 2)

```bash
cd ai-learning-assistant/frontend
npm install  # First time only
npm run dev
```

**Wait for:**
```
➜  Local:   http://localhost:5173/
```

---

## STEP 3: Create Test User

```bash
# In backend terminal, press Ctrl+C to stop, then:
npm run seed

# See output:
# ✅ Test user created successfully
# Email: testuser@example.com
# Password: Test@1234
```

**Tip:** Restart backend: `npm run dev`

---

## STEP 4: Login

1. Open browser: **http://localhost:5173**
2. Enter:
   - Email: `testuser@example.com`
   - Password: `Test@1234`
3. Click **Login**

---

## ✨ Done!

You should now see the dashboard. If something fails, check **COMPLETE_SETUP_VERIFICATION.md** for troubleshooting.

---

## Using Windows Batch Files (Even Faster)

Instead of typing commands:

**Backend:** Double-click `backend/START_BACKEND.bat`  
**Frontend:** Double-click `frontend/START_FRONTEND.bat`

Both validate everything and start the servers automatically!

