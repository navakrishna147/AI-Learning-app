# Backend Startup Guide

## Prerequisites

1. **Node.js** (v18+) - Download from https://nodejs.org/
2. **MongoDB** - Must be running before starting the backend

## Starting MongoDB

### Windows
```bash
# Option 1: Using MongoDB Community Edition
mongod

# Option 2: If installed as a service
net start MongoDB
```

### Mac
```bash
# Using Homebrew
brew services start mongodb-community
```

### Linux
```bash
# Using systemctl
sudo systemctl start mongod
```

### Verify MongoDB is Running
```bash
mongosh  # or mongo
# Should connect successfully
```

## Starting the Backend Server

1. Navigate to the backend directory:
```bash
cd ai-learning-assistant/backend
```

2. Install dependencies (first time only):
```bash
npm install
```

3. Create `.env` file (if not exists):
```bash
# Copy from .env.example and update values
cp .env.example .env
```

4. Start the server:

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

## If Server Crashes

### Error: "MongoDB connection failed"
- Make sure MongoDB is running (see instructions above)
- Check MONGODB_URI in .env file
- Try connecting with `mongosh` first

### Error: "[nodemon] app crashed - waiting for file changes"
- MongoDB is likely not running
- Start MongoDB first, then the server will auto-reload
- Or save a file to trigger a restart

### Error: "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or change PORT in .env
```

## Success Indicators

✅ You should see this in the terminal:
```
Server is running on port 5000
http://localhost:5000/
MongoDB Connected: localhost
```

## Testing the API

```bash
# Health check
curl http://localhost:5000/

# Should respond with:
# {"message":"AI Learning Assistant API is running!"}
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| App keeps crashing | Start MongoDB first |
| Port already in use | Change PORT in .env or kill process |
| Modules not found | Run `npm install` again |
| .env file not loading | Make sure .env is in backend/ directory |
| Connection refused | Check MONGODB_URI, ensure MongoDB running |
