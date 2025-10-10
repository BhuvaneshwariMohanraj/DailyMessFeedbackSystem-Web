# 🤖 AI-Enhanced Daily Mess Feedback System - Setup Guide

## Overview
This guide will help you set up the AI-enhanced version of the Daily Mess Feedback System with Google Gemini API integration.

## 🎯 What's New with AI
- **Intelligent Feedback Analysis**: Automatic sentiment analysis and categorization
- **Priority Scoring**: AI assigns urgency levels (1-10) to feedback
- **Real-time Alerts**: Instant notifications for critical issues
- **Health & Safety Detection**: Automatic flagging of health concerns
- **AI-Generated Insights**: Smart recommendations for mess management

## 🚀 Quick Start

### Step 1: Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key (keep it secure!)

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file and add your credentials:
```env
# Database (your existing config)
DB_SERVER=your-server.database.windows.net
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
PORT=5000

# 🤖 AI Configuration (NEW)
GEMINI_API_KEY=your_gemini_api_key_here

# 📧 Email Alerts (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL_RECIPIENTS=admin@mess.com,manager@mess.com
```

Start the backend:
```bash
npm run dev
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎮 How to Use AI Features

### For Students
1. **Submit Feedback**: Write detailed comments about your meal
2. **AI Analysis**: Your feedback is automatically analyzed for:
   - Sentiment (positive/neutral/negative)
   - Category (Food Quality, Service, Hygiene, etc.)
   - Priority level (1-10 scale)
   - Health & safety concerns

### For Administrators
1. **Access AI Dashboard**: Login as admin and go to "🤖 AI Insights" tab
2. **View Real-time Alerts**: Critical issues appear immediately
3. **Monitor Trends**: See AI-generated insights and recommendations
4. **Manage Priorities**: Focus on high-priority feedback first

## 📊 AI Dashboard Features

### 1. Real-time Alert System
- 🚨 **Critical Alerts**: Priority 9-10 (Health/Safety issues)
- ⚠️ **High Priority**: Priority 7-8 (Service disruptions)
- 📧 **Email Notifications**: Automatic for urgent issues
- 🔔 **Browser Notifications**: Real-time dashboard updates

### 2. AI Analytics
- **Sentiment Breakdown**: Visual representation of feedback sentiment
- **Category Analysis**: Issues grouped by type (Food Quality, Service, etc.)
- **Priority Distribution**: See urgency levels across all feedback
- **Health & Safety Tracking**: Monitor critical concerns

### 3. Smart Insights
- **AI-Generated Reports**: Automated analysis of feedback patterns
- **Trend Detection**: Identify recurring issues
- **Actionable Recommendations**: AI suggests improvements

## 🔧 API Endpoints (New)

### Admin AI Routes
- `GET /api/admin/insights` - Get AI-powered dashboard insights
- `GET /api/admin/alerts` - Get urgent alerts requiring attention
- `POST /api/admin/test-alerts` - Test the alert system
- `PATCH /api/admin/feedback/:id/status` - Update feedback status
- `POST /api/admin/reanalyze/:id` - Re-analyze feedback with AI

### Feedback Enhancement
- Feedback submission now includes automatic AI analysis
- Real-time alerts triggered for high-priority issues
- Enhanced database schema with AI analysis fields

## 🛠 Database Schema Updates

New AI fields added to Feedback table:
```sql
-- AI Analysis Fields
ai_priority_score INT DEFAULT NULL, -- 1-10 priority score
ai_priority_level NVARCHAR(10) DEFAULT NULL, -- LOW, MEDIUM, HIGH, URGENT
ai_sentiment NVARCHAR(10) DEFAULT NULL, -- positive, neutral, negative
ai_category NVARCHAR(50) DEFAULT NULL, -- Food Quality, Service, etc.
ai_keywords NVARCHAR(200) DEFAULT NULL, -- JSON array of keywords
ai_summary NVARCHAR(300) DEFAULT NULL, -- AI generated summary
ai_recommended_action NVARCHAR(200) DEFAULT NULL, -- Suggested action
ai_escalation_needed BIT DEFAULT 0, -- Whether escalation is needed
ai_health_safety_concern BIT DEFAULT 0, -- Health/safety flag
ai_analyzed_at DATETIME DEFAULT NULL, -- When AI analysis was done
```

## 🧪 Testing the AI System

### 1. Test Feedback Analysis
Submit feedback with different types of comments:

**Health Concern (Should be Priority 10):**
```
"The chicken curry today smelled bad and many students got stomach ache after eating it."
```

**Service Issue (Should be Priority 7-8):**
```
"The food counter was closed during lunch time and staff was very rude to students."
```

**Quality Issue (Should be Priority 4-6):**
```
"The rice was too salty today and the dal was cold."
```

**Positive Feedback (Should be Priority 1-3):**
```
"The food was delicious today, especially the dessert. Great job!"
```

### 2. Test Alert System
1. Submit a high-priority feedback (health concern)
2. Check admin dashboard for real-time alerts
3. Verify email notifications (if configured)
4. Test alert resolution workflow

### 3. Test AI Insights
1. Submit multiple feedback entries
2. Go to AI Insights dashboard
3. Verify sentiment analysis
4. Check category breakdown
5. Review AI-generated insights

## 🚨 Troubleshooting

### AI Not Working
1. **Check API Key**: Ensure `GEMINI_API_KEY` is valid
2. **Check Quota**: Verify your Gemini API quota isn't exceeded
3. **Check Logs**: Look for AI service errors in backend console
4. **Fallback Analysis**: System uses rule-based analysis if AI fails

### Alerts Not Working
1. **Socket.IO Connection**: Check browser console for connection errors
2. **Email Configuration**: Verify email settings in `.env`
3. **Notification Permissions**: Allow browser notifications

### Performance Issues
1. **API Rate Limits**: Gemini API has rate limits
2. **Database Performance**: AI fields are indexed for better performance
3. **Caching**: Consider implementing caching for frequent queries

## 🔒 Security Considerations

1. **API Key Security**: Never commit API keys to version control
2. **Environment Variables**: Use `.env` files for sensitive data
3. **Rate Limiting**: Implement rate limiting for AI API calls
4. **Input Validation**: Sanitize user input before AI analysis

## 📈 Monitoring & Analytics

### Key Metrics to Track
- AI analysis success rate
- Alert response times
- Feedback resolution rates
- Health & safety incident detection
- User satisfaction trends

### Logging
- AI service calls and responses
- Alert triggers and resolutions
- Error rates and failures
- Performance metrics

## 🚀 Next Steps

### Potential Enhancements
1. **Multi-language Support**: Translate feedback before analysis
2. **Image Analysis**: Analyze food photos with AI
3. **Predictive Analytics**: Forecast issues before they occur
4. **Integration**: Connect with mess management systems
5. **Mobile App**: Real-time notifications on mobile devices

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review console logs for errors
3. Verify all environment variables are set
4. Test with simple feedback examples first

---

**🎉 Congratulations!** You now have an AI-powered mess feedback system that can automatically analyze feedback, detect critical issues, and provide intelligent insights for better mess management.
