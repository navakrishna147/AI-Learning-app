# Complete Setup Guide 🚀

This guide will walk you through setting up the AI Learning Assistant from scratch.

## Step 1: Install Prerequisites

### Install Node.js
Visit https://nodejs.org/ and download the LTS version (v18 or higher)

Verify installation:
```bash
node --version
npm --version
```

### Install MongoDB

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Ubuntu/Linux:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows:
Download from https://www.mongodb.com/try/download/community

### Verify MongoDB Installation:
```bash
mongosh
# If connected successfully, you'll see the MongoDB shell
# Type 'exit' to quit
```

## Step 2: Get Anthropic API Key

1. Visit https://console.anthropic.com/
2. Sign up for an account or log in
3. Navigate to "API Keys" in the dashboard
4. Click "Create API Key"
5. Copy your API key (starts with `sk-ant-`)
6. **Important**: Save this key securely - you won't be able to see it again!

## Step 3: Clone and Setup

### Clone the Repository
```bash
git clone <repository-url>
cd ai-learning-assistant
```

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit the `.env` file with your details:
```env
MONGODB_URI=mongodb://localhost:27017/ai-learning-assistant
JWT_SECRET=change_this_to_a_long_random_string_for_security
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
PORT=5000
MAX_FILE_SIZE=10485760
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

## Step 4: Start the Application

### Option 1: Run Both Services Manually

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Option 2: Use a Process Manager

Install PM2 globally:
```bash
npm install -g pm2
```

Create `ecosystem.config.js` in the root directory:
```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      }
    },
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
      }
    }
  ]
};
```

Start both:
```bash
pm2 start ecosystem.config.js
pm2 logs
```

## Step 5: Test the Application

1. Open your browser and go to http://localhost:5173
2. You should see the login page
3. Click "Sign up" to create an account
4. Enter:
   - Username: TestUser
   - Email: test@example.com
   - Password: test123
5. After signup, you'll be redirected to the dashboard
6. Click "Documents" in the sidebar
7. Upload a PDF file
8. Click on the document to view it
9. Try the Chat, Flashcards, and Quiz features!

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
net start MongoDB
```

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill

# Or change the port in backend/.env
PORT=5001
```

### Issue: "Module not found"
**Solution:**
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Anthropic API Error"
**Solutions:**
1. Verify your API key is correct in `.env`
2. Check you have credits in your Anthropic account
3. Ensure there are no extra spaces in the API key
4. Restart the backend server after changing `.env`

### Issue: "PDF Upload Failed"
**Solutions:**
1. Check the file is actually a PDF
2. Ensure file is under 10MB
3. Verify `backend/uploads` directory exists and has write permissions:
   ```bash
   mkdir -p backend/uploads
   chmod 755 backend/uploads
   ```

### Issue: "JWT Token Invalid"
**Solution:**
```bash
# Clear browser localStorage
# Open browser console (F12) and run:
localStorage.clear()
# Then refresh the page
```

## Database Management

### View Database Contents
```bash
mongosh
use ai-learning-assistant
db.users.find()
db.documents.find()
db.flashcards.find()
```

### Reset Database
```bash
mongosh
use ai-learning-assistant
db.dropDatabase()
```

### Backup Database
```bash
mongodump --db ai-learning-assistant --out ./backup
```

### Restore Database
```bash
mongorestore --db ai-learning-assistant ./backup/ai-learning-assistant
```

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes to React files reload automatically
- Backend: Uses nodemon to restart on file changes

### Debugging

**Backend:**
Add console.logs or use VS Code debugger:
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/server.js",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```

**Frontend:**
Use React DevTools browser extension

### Testing API Endpoints

Use curl or Postman:
```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Production Deployment

### Environment Variables
Set these in your production environment:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong secret key
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `NODE_ENV`: Set to `production`

### Build Frontend
```bash
cd frontend
npm run build
```

### Deploy Options

**Backend:**
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

**Frontend:**
- Vercel
- Netlify
- AWS S3 + CloudFront

**Database:**
- MongoDB Atlas (recommended)
- AWS DocumentDB
- DigitalOcean Managed MongoDB

## Next Steps

1. Customize the UI colors in `frontend/tailwind.config.js`
2. Add more AI features
3. Implement spaced repetition for flashcards
4. Add support for more file types
5. Create mobile apps using React Native

## Need Help?

- Check the main README.md
- Review error messages carefully
- Search GitHub issues
- Ask in the community

Happy coding! 🚀
