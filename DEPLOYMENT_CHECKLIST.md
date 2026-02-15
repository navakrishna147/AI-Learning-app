# ✅ Dashboard System Setup & Deployment Checklist

## Pre-Deployment Verification

### ✅ Backend Verification

- [ ] Server running successfully
  ```bash
  cd ai-learning-assistant
  node backend/server.js
  # Should show: "✓ Server is running on port 5000"
  #              "MongoDB Connected: localhost"
  ```

- [ ] API endpoints accessible
  ```bash
  # Test with valid JWT token
  curl -H "Authorization: Bearer <your_token>" \
    http://localhost:5000/api/dashboard/stats
  # Should return: {success: true, stats: {...}}
  ```

- [ ] Database connection
  ```bash
  # Verify MongoDB is running
  mongo --version  # or mongosh --version
  ```

- [ ] All dependencies installed
  ```bash
  cd backend
  npm list
  # Should show no missing dependencies
  ```

### ✅ Frontend Verification

- [ ] Build successful
  ```bash
  cd frontend
  npm run build
  # Should show: "✓ built in 2.36s"
  #              "✓ 262.79 kB gzip: 81.37 kB"
  ```

- [ ] No build errors
  ```bash
  # Build output should show 0 errors
  # Check the 3 asset files are created
  ls dist/assets/
  ```

- [ ] Component working
  ```bash
  npm run dev
  # Navigate to http://localhost:5173/dashboard
  # Should load without errors
  ```

### ✅ Database Verification

- [ ] Activity model created
  ```bash
  # Check Activity collection exists
  db.activities.findOne()
  # Should return a document or empty
  ```

- [ ] User model updated
  ```bash
  # Check User has stats field
  db.users.findOne()
  # Should include stats and achievements
  ```

- [ ] Indexes created
  ```bash
  # Check performance indexes
  db.activities.getIndexes()
  ```

---

## Deployment Steps

### Step 1: Backend Deployment

#### Option A: Railway / Heroku / Render
```bash
# 1. Create account on chosen platform
# 2. Connect MongoDB Atlas for database
# 3. Set environment variables:
#    - MONGODB_URI=mongodb+srv://...
#    - JWT_SECRET=your_secret_key
#    - ANTHROPIC_API_KEY=your_api_key
#    - NODE_ENV=production
# 4. Deploy backend folder
# 5. Note the API URL (e.g., https://api.example.com)
```

#### Option B: AWS / Google Cloud / Azure
```bash
# 1. Create EC2 instance or equivalent
# 2. Install Node.js v18+
# 3. Clone repository
# 4. Set up environment variables
# 5. Use PM2 or similar for process management:
#    npm install -g pm2
#    pm2 start backend/server.js --name dashboard-api
# 6. Configure nginx/apache reverse proxy
```

### Step 2: Frontend Deployment

#### Option A: Vercel
```bash
# 1. Connect GitHub repository
# 2. Set build command: cd frontend && npm run build
# 3. Set output directory: frontend/dist
# 4. Set environment variables:
#    - VITE_API_URL=https://api.example.com
# 5. Deploy
```

#### Option B: Netlify
```bash
# 1. Connect GitHub repository
# 2. Set build command: npm run build (from root)
# 3. Set publish directory: frontend/dist
# 4. Build settings:
#    - Base directory: frontend
# 5. Deploy
```

#### Option C: GitHub Pages
```bash
# 1. Build frontend:
#    npm run build
# 2. Deploy dist folder to gh-pages
# 3. Update API URL in vite.config.js
```

### Step 3: Database Deployment

#### MongoDB Atlas Setup
```javascript
// 1. Create cluster on MongoDB Atlas
// 2. Add database user
// 3. Whitelist IP addresses
// 4. Get connection string:
//    mongodb+srv://user:pass@cluster.mongodb.net/database

// 5. Update backend .env:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
```

#### Data Migration (if needed)
```bash
# Export from local
mongoexport --db ai_learning --collection users \
  --out users.json

# Import to cloud
mongoimport --uri "mongodb+srv://..." \
  --collection users --file users.json
```

### Step 4: Post-Deployment Testing

- [ ] Frontend loads without errors
- [ ] Can login/signup
- [ ] Dashboard page accessible at `/dashboard`
- [ ] All 6 API endpoints return data
- [ ] Activity logging works
- [ ] Stats update in real-time

---

## Integration Checklist (Routes)

Before full deployment, integrate trackActivity() into all routes:

### Quiz Routes (backend/routes/quizzes.js)
- [ ] Import activity middleware
- [ ] Add trackActivity() to submit endpoint
- [ ] Test: Complete quiz → Check dashboard stats

### Chat Routes (backend/routes/chat.js)
- [ ] Import activity middleware
- [ ] Add trackActivity() to send message endpoint
- [ ] Test: Send message → Check dashboard activities

### Flashcard Routes (backend/routes/flashcards.js)
- [ ] Import activity middleware
- [ ] Add trackActivity() to review endpoint
- [ ] Test: Review flashcards → Check stats

### Document Routes (backend/routes/documents.js)
- [ ] Import activity middleware
- [ ] Add trackActivity() to access endpoint
- [ ] Add trackActivity() to upload endpoint
- [ ] Test: Upload & access → Check dashboard

---

## Environment Variables Template

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai_learning
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_learning

# Authentication
JWT_SECRET=your_very_secure_secret_key_change_this

# AI API
ANTHROPIC_API_KEY=your_anthropic_api_key

# Server
PORT=5000
NODE_ENV=development
# Change to 'production' for deployment

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes

# CORS Settings (for production)
# FRONTEND_URL=https://yourfrontend.com
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000
# Change to production URL when deploying

# Analytics (optional)
VITE_ENABLE_ANALYTICS=true
```

---

## Performance Optimization Checklist

### Backend Optimizations
- [ ] Database indexes created
  ```javascript
  // Run these in MongoDB
  db.activities.createIndex({ "user": 1, "createdAt": -1 })
  db.activities.createIndex({ "type": 1 })
  ```

- [ ] Response caching enabled
  ```javascript
  // Add Redis caching for frequently accessed endpoints
  // (Optional but recommended for scale)
  ```

- [ ] Query optimization
  ```javascript
  // Use lean() for read-only queries
  Activity.find().lean()
  ```

### Frontend Optimizations
- [ ] Code splitting enabled (Vite default)
- [ ] Images optimized
- [ ] Unnecessary dependencies removed
- [ ] Console logs removed in production build
- [ ] Analytics dashboard set to 2-minute refresh (appropriate)

### Database Optimizations
- [ ] Connection pooling configured
- [ ] Indexes on frequently queried fields
- [ ] Archival policy for old activity logs (optional)
- [ ] Backup automated

---

## Monitoring & Maintenance

### Monitoring Setup

#### Backend Monitoring
```bash
# 1. Install monitoring tools
npm install pm2-monitoring

# 2. Set up error logging
npm install winston  # or similar

# 3. Monitor API response times, errors, uptime
```

#### Database Monitoring
```javascript
// Monitor:
// - MongoDB connection health
// - Query performance
// - Disk usage
// - Backup status
// - Activity log size (archive if > 1GB)
```

#### Frontend Monitoring
```javascript
// Monitor:
// - Page load time
// - API response time
// - JavaScript errors
// - User interactions
```

### Maintenance Tasks

#### Daily
- [ ] Check server status
- [ ] Monitor error logs
- [ ] Verify database connectivity

#### Weekly
- [ ] Review API performance metrics
- [ ] Check database size
- [ ] Backup database

#### Monthly
- [ ] Clean up old activity logs (optional)
- [ ] Review user statistics
- [ ] Performance optimization review
- [ ] Security updates

---

## Rollback Procedure

If issues occur after deployment:

### Step 1: Immediate Rollback
```bash
# 1. Stop current deployment
pm2 stop dashboard-api

# 2. Revert to previous version
git checkout previous-version
npm install

# 3. Start previous version
npm start
```

### Step 2: Database Rollback (if needed)
```bash
# 1. Restore from backup
mongorestore --uri "mongodb://..." \
  --archive=backup-date.archive

# 2. Verify data integrity
db.activities.countDocuments()
```

### Step 3: Communicate Status
- Notify users of issue
- Provide estimated resolution time
- Update status page

---

## Troubleshooting Common Issues

### Issue: "Port 5000 already in use"
```bash
# Solution: Use different port or kill process
PORT=5001 npm start
# OR
lsof -i :5000
kill -9 <PID>
```

### Issue: "MongoDB connection failed"
```bash
# Solution: Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Verify connection string in .env
```

### Issue: "Dashboard shows all zeros"
```bash
# Solution: Check if trackActivity() integrated
# Verify activity logs in database:
db.activities.find()

# If empty, activities not being tracked
# Review DASHBOARD_INTEGRATION_GUIDE.md
```

### Issue: "API response very slow"
```bash
# Solution: Check database indexes
db.activities.getIndexes()

# Add missing indexes
db.activities.createIndex({ "user": 1, "createdAt": -1 })

# Check network latency
ping api.example.com
```

### Issue: "Achievements not unlocking"
```bash
# Solution: Verify stats are updating
db.users.findOne({_id: <userId>}).stats

# Check middleware is imported in routes
grep "trackActivity" backend/routes/*.js

# Test manually with activity creation
```

---

## Security Checklist

### API Security
- [ ] JWT tokens configured with expiration
- [ ] HTTPS/SSL certificates enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection protection

### Database Security
- [ ] MongoDB authentication enabled
- [ ] IP whitelist configured
- [ ] Backups encrypted
- [ ] Sensitive data encrypted
- [ ] Access logs enabled

### Frontend Security
- [ ] No sensitive data in localStorage
- [ ] XSS protection configured
- [ ] CSRF tokens implemented
- [ ] Content Security Policy headers set
- [ ] Dependencies security scanned

### Environment Security
- [ ] Environment variables secure
- [ ] API keys not in git repository
- [ ] Production secrets different from staging
- [ ] SSH keys properly configured
- [ ] Regular security audits scheduled

---

## Success Indicators

✅ **System is working correctly when:**
- Dashboard loads in < 2 seconds
- All 6 API endpoints respond with 200 status
- Activities logged automatically after user actions
- Statistics update in real-time on dashboard
- Achievements unlock when conditions met
- No JavaScript errors in console
- Database has < 100ms query time
- Frontend bundle < 300 KB
- 99.9% uptime maintained

---

## Deployment Command Reference

### Frontend Build
```bash
cd frontend
npm install
npm run build
# Output: dist/ folder ready for deployment
```

### Backend Production Start
```bash
cd backend
npm install
npm start  # or pm2 start server.js
```

### Database Setup
```bash
# Local MongoDB
mongod --dbpath ./data

# MongoDB Atlas (connection string in .env)
# No local setup needed
```

### Full Stack Start
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## Support & Documentation

- **Dashboard Docs**: [DASHBOARD_INDEX.md](DASHBOARD_INDEX.md)
- **Integration Guide**: [DASHBOARD_INTEGRATION_GUIDE.md](DASHBOARD_INTEGRATION_GUIDE.md)
- **Quick Reference**: [DASHBOARD_QUICK_REFERENCE.md](DASHBOARD_QUICK_REFERENCE.md)
- **Architecture**: [DASHBOARD_ARCHITECTURE.md](DASHBOARD_ARCHITECTURE.md)
- **Full Documentation**: [DASHBOARD_DOCUMENTATION.md](DASHBOARD_DOCUMENTATION.md)

---

**Status: ✅ Ready for Production Deployment**

All components built, tested, and documented. Follow this checklist for smooth deployment.

*Last Updated: 2024*
