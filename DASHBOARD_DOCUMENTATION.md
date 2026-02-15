# 📊 Dashboard & Analytics System Documentation

## Overview

The Dashboard is a comprehensive analytics and tracking system that provides users with detailed insights into their learning progress, achievements, and activity patterns.

---

## ✨ Features Implemented

### **1. Overview Tab**
- **Key Metrics Cards:**
  - Total Documents uploaded
  - Total Flashcards generated
  - Total Quizzes completed
  - Study time and current streak

- **Recent Achievements:**
  - Display unlocked badges
  - Show description and unlock date
  - Visual emoji indicators

- **Progress Tracking:**
  - Current learning streak (days)
  - Average quiz score
  - Progress bars with visual indicators

- **Recent Activities:**
  - Last 8 user activities
  - Timestamps
  - Activity descriptions

### **2. Analytics Tab**
- **Feature Usage Chart:**
  - Track usage of Chat, Quiz, Flashcards, Documents
  - Visual bar representations
  - Comparative analysis

- **Quiz Performance:**
  - Last 5 quiz attempts
  - Score visualization with color coding
  - Green (80%+), Yellow (60-80%), Red (<60%)

- **Weekly Activity Breakdown:**
  - Daily activity visualization
  - Time spent per day
  - Feature-specific activity counts

### **3. Goals Tab**
- **Learning Goals:**
  1. Complete 10 Quizzes (target-based)
  2. Review 50 Flashcards
  3. Maintain 7-Day Streak
  4. Achieve 80% Average Quiz Score
  5. Study 10 Hours Total

- **Progress Visualization:**
  - Individual goal cards
  - Progress bars showing completion percentage
  - Current vs. Target metrics
  - Completion badges (✅)

### **4. Achievements Tab**
- **Achievement System with 8 Badges:**
  1. 🚀 First Steps - Upload first document
  2. 🎯 Quiz Master - Complete 10 quizzes
  3. ⭐ Perfect Score - Score 100% on quiz
  4. 🔥 Study Streak - Study 7 days straight
  5. 📚 Flashcard Fanatic - Review 100 flashcards
  6. 💬 Conversationalist - Have 50 AI chats
  7. ⏰ Time Tracker - Study 20 hours total
  8. 🏆 High Achiever - Achieve 85% average score

- **Achievement Details:**
  - Display name and description
  - Icon representation
  - Unlock date for completed achievements
  - Progress percentage

---

## 🏗️ Architecture

### **Backend Components**

#### **Models**

**Activity Model (Enhanced)**
```javascript
{
  user: ObjectId,
  type: 'document_access' | 'quiz_complete' | 'flashcard_review' | 'chat' | 'document_upload',
  description: String,
  document: ObjectId (optional),
  quiz: ObjectId (optional),
  chat: ObjectId (optional),
  metadata: {
    quizScore: Number,
    timeSpent: Number (seconds),
    flashcardsReviewed: Number,
    messagesExchanged: Number
  },
  timestamps
}
```

**User Model (Enhanced)**
```javascript
{
  // ... existing fields
  stats: {
    totalQuizzesCompleted: Number,
    totalFlashcardsReviewed: Number,
    totalChatMessages: Number,
    averageQuizScore: Number,
    totalTimeSpent: Number (seconds),
    currentStreak: Number,
    longestStreak: Number,
    lastActivityDate: Date
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: Date,
    icon: String
  }]
}
```

#### **Controllers**

**dashboardController.js** - 6 main endpoints:

1. **getStats()** - `/api/dashboard/stats`
   ```
   Returns:
   - overview: totalDocuments, totalFlashcards, totalQuizzes, 
              completedQuizzes, averageQuizScore, todayActivities
   - userStats: all user statistics
   - today: documentsUploaded, activitiesCount
   ```

2. **getAnalytics()** - `/api/dashboard/analytics?days=7`
   ```
   Returns:
   - activityByDay: grouped by date with feature breakdown
   - quizPerformance: score tracking per quiz
   - featureUsage: usage count for each feature
   - totalActivities: count for period
   ```

3. **getActivities()** - `/api/dashboard/activities?limit=15`
   ```
   Returns:
   - Array of recent activities with timestamps
   - Populated document references
   - Sorted by newest first
   ```

4. **getLearningGoals()** - `/api/dashboard/learning-goals`
   ```
   Returns:
   - Array of learning goals
   - Current vs. target metrics
   - Progress percentage
   - Completion status
   ```

5. **getAchievements()** - `/api/dashboard/achievements`
   ```
   Returns:
   - Array of all achievements
   - Unlock status
   - Unlock dates
   - Progress percentage
   ```

6. **getSummary()** - `/api/dashboard/summary`
   ```
   Returns:
   - User info
   - Stats
   - Achievements
   - Activity: thisWeek, recentDocuments, topQuizzes
   ```

#### **Middleware**

**activity.js** - Activity tracking:

```javascript
trackActivity(userId, type, description, documentId, metadata)
- Automatically logs user actions
- Updates user statistics
- Manages streaks (daily learning consistency)
- Calculates average scores

logActivity(type)
- Middleware wrapper for automatic logging
- Tracks successful API responses
- Updates metadata with response data
```

### **Frontend Components**

**EnhancedDashboard.jsx**

- **Layout:**
  - Tab-based navigation (Overview, Analytics, Goals, Achievements)
  - Responsive grid system
  - Real-time data updates (every 2 minutes)

- **State Management:**
  - Central data state for all dashboard metrics
  - Loading states
  - Error handling

- **Data Fetching:**
  - Parallel API calls for performance
  - Automatic refresh interval

---

## 📊 Data Flow

### **Activity Tracking Flow**

```
User Action (Quiz Submit, Flashcard Review, Chat, Document Upload)
    ↓
API Endpoint Handler
    ↓
Response Interceptor (logActivity middleware)
    ↓
trackActivity() function
    ↓
1. Create Activity record in MongoDB
2. Update User.stats
3. Calculate/Update streak
4. Update achievements if condition met
    ↓
Activity logged & Statistics updated
```

### **Dashboard Data Load Flow**

```
EnhancedDashboard Component mounts
    ↓
useEffect calls fetchDashboardData()
    ↓
Parallel Promise.all() with 6 API calls:
├─ /dashboard/stats
├─ /dashboard/analytics
├─ /dashboard/learning-goals
├─ /dashboard/achievements
├─ /dashboard/activities
└─ /dashboard/summary
    ↓
Data processed and stored in state
    ↓
Component renders with live data
    ↓
Auto-refresh every 2 minutes
```

---

## 🎯 API Endpoints Reference

### **Base URL:** `http://localhost:5000/api/dashboard`

All endpoints require authentication (JWT token).

| Endpoint | Method | Query Params | Returns |
|----------|--------|--------------|---------|
| `/stats` | GET | - | Overall statistics |
| `/analytics` | GET | `?days=7` | Detailed analytics for period |
| `/activities` | GET | `?limit=15` | Recent activities list |
| `/learning-goals` | GET | - | Array of learning goals |
| `/achievements` | GET | - | Achievement system data |
| `/summary` | GET | - | Complete user summary |

---

## 📈 Statistics Calculated

### **Daily Metrics**
- Documents uploaded today
- Activities count
- Time spent today

### **Overall Metrics**
- Total documents, flashcards, quizzes
- Average quiz score (weighted)
- Total study time (in seconds → converted to hours)
- Current streak (days)
- Longest streak (historical)

### **Weekly Analytics**
- Feature usage breakdown
- Activity distribution by day
- Quiz performance trend
- Time spent per day

### **Achievement Unlocking**
Achievements unlock automatically when conditions are met:
- Condition checked on each activity
- Stored in user.achievements array
- Compared against user.stats
- Toast notification on unlock (optional)

---

## 🔄 Integration Points

### **With Quiz System**
- Quiz submission triggers activity log
- Score captured in metadata
- Average score calculation updated
- "Quiz Master" achievement status checked

### **With Flashcard System**
- Card review triggers activity
- Count accumulated toward flashcard goal
- "Flashcard Fanatic" achievement checked

### **With Chat System**
- Each message (user + assistant) triggers activity
- Message count tracked
- "Conversationalist" achievement tracked

### **With Document System**
- Upload triggers activity
- Access tracked
- Document type metadata captured

---

## 📱 Frontend Usage

### **Importing and Using EnhancedDashboard**

```jsx
import EnhancedDashboard from './pages/EnhancedDashboard';

// In your router
<Route path="/dashboard" element={<EnhancedDashboard />} />
```

### **Data Refresh**

The dashboard automatically:
- Fetches all data on component mount
- Refreshes every 2 minutes
- Cleans up intervals on unmount

To manually refresh:
```jsx
const { fetchDashboardData } = useCallback(async () => {
  // Re-call all APIs
}, []);

// Call manually when needed
fetchDashboardData();
```

---

## 🛠️ Customization

### **Add New Goal**

Edit `getLearningGoals()` in dashboardController.js:

```javascript
{
  id: 6,
  title: 'Your Custom Goal',
  current: user?.stats?.yourField || 0,
  target: 100,
  icon: 'icon-name',
  category: 'category'
}
```

### **Add New Achievement**

Edit `getAchievements()` in dashboardController.js:

```javascript
yourAchievement: {
  name: 'Achievement Name',
  description: 'Description...',
  condition: (stats) => stats.someField >= targetValue,
  icon: '🎖️'
}
```

### **Modify Styling**

All components use Tailwind CSS classes and can be customized in:
- `EnhancedDashboard.jsx` - Main component styling
- Modify colors, spacing, sizes as needed

---

## 📊 Example API Responses

### **GET /api/dashboard/stats**
```json
{
  "overview": {
    "totalDocuments": 5,
    "totalFlashcards": 45,
    "totalQuizzes": 12,
    "completedQuizzes": 12,
    "averageQuizScore": 78.5,
    "todayActivities": 3
  },
  "userStats": {
    "totalQuizzesCompleted": 12,
    "totalFlashcardsReviewed": 38,
    "totalChatMessages": 24,
    "averageQuizScore": 78.5,
    "totalTimeSpent": 14400,
    "currentStreak": 5,
    "longestStreak": 7
  },
  "today": {
    "documentsUploaded": 1,
    "activitiesCount": 3
  }
}
```

### **GET /api/dashboard/analytics?days=7**
```json
{
  "period": "Last 7 days",
  "activityByDay": {
    "2/11/2026": {
      "chat": 2,
      "quiz": 1,
      "flashcard": 5,
      "document": 1,
      "totalTime": 3600
    }
  },
  "quizPerformance": [
    {
      "date": "2/11/2026",
      "score": 85
    }
  ],
  "featureUsage": {
    "chat": 10,
    "quiz": 3,
    "flashcard": 15,
    "document": 5
  },
  "totalActivities": 33
}
```

---

## ⚡ Performance Considerations

- **Caching:** Consider implementing Redis cache for frequently accessed stats
- **Batch Queries:** Uses Promise.all() for parallel fetching
- **Indexing:** Activity schema includes indexes on `user` + `createdAt`
- **Pagination:** Limit results in activities endpoint
- **Real-time Updates:** Auto-refresh every 2 minutes (configurable)

---

## 🔐 Security

- All endpoints protected by JWT authentication middleware
- User can only see their own data
- Activities linked to authenticated user
- No sensitive data exposed in responses

---

## 🚀 Deployment Checklist

- [x] Activity model updated
- [x] User model enhanced with stats
- [x] Dashboard controller comprehensive
- [x] Routes configured
- [x] Activity middleware created
- [x] Frontend component built
- [x] Frontend routes updated
- [x] Data fetching implemented
- [x] Error handling added
- [ ] Rate limiting on dashboard endpoints (optional)
- [ ] Caching strategy (optional)

---

## 📝 Future Enhancements

1. **Export Data:** Allow users to download their analytics as PDF/CSV
2. **Goal Notifications:** Email/In-app notifications when goals near completion
3. **Charts Library:** Integrate Chart.js or Recharts for advanced visualizations
4. **Leaderboards:** Compare progress with other learners
5. **Weekly Digest:** Email summary of weekly progress
6. **Custom Goals:** Allow users to create their own learning goals
7. **Badges Display:** Show earned badges on user profile
8. **Mobile App:** Dedicated mobile dashboard interface
9. **Real-Time Updates:** WebSocket for live dashboard updates
10. **Analytics Export:** Share progress reports

---

## 🐛 Troubleshooting

### **Dashboard not loading data**
- Check network tab for API errors
- Verify authentication token is valid
- Check browser console for JavaScript errors
- Ensure backend is running on port 5000

### **Activities not tracking**
- Verify activity middleware is imported in routes
- Check that trackActivity() calls are being made
- Confirm user stats are being updated
- Check MongoDB connection

### **Achievements not unlocking**
- Verify achievement conditions logic
- Check user.stats are being updated
- Confirm API response includes achievement data
- Check achievement icons display correctly

---

**Status:** ✅ Production Ready  
**Last Updated:** February 11, 2026  
**Version:** 1.0
