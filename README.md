# Daily Mess Feedback System with AI

A full-stack web application for collecting and managing daily feedback on mess meals and services, enhanced with **AI-powered insights** using Google's Gemini API.

## 🚀 New AI Features
- **🤖 Intelligent Feedback Analysis**: Automatic sentiment analysis and categorization
- **📊 Priority Scoring**: AI assigns urgency levels (1-10) to feedback
- **🚨 Real-time Alerts**: Instant notifications for critical issues
- **⚕️ Health & Safety Detection**: Automatic flagging of health concerns
- **📈 AI-Generated Insights**: Smart recommendations for mess management
- **🔔 Multi-channel Notifications**: Email, SMS, and dashboard alerts

## Tech Stack
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO
- **Frontend**: React, Vite, Tailwind CSS, Shadcn/ui
- **Database**: Azure SQL Database
- **AI**: Google Gemini API
- **Real-time**: Socket.IO for live alerts

## Features
- User authentication and role-based access
- Daily feedback submission with ratings and comments
- Feedback history for users
- Admin dashboard for reports and analytics
- Anonymous feedback option

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Azure SQL Database access
- **Google Gemini API Key** (Get from: https://makersuite.google.com/app/apikey)

## Team Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/BhuvaneshwariMohanraj/DailyMessFeedbackSystem-Web.git
cd DailyMessFeedbackSystem-Web
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your credentials
# Update the following variables:
# DB_SERVER=your-server.database.windows.net
# DB_NAME=your-database-name
# DB_USER=your-username
# DB_PASSWORD=your-password
# PORT=5000
# GEMINI_API_KEY=your_gemini_api_key_here

# Start the backend server
npm run dev
```

### 3. Frontend Setup (Open new terminal)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Development Commands

### Backend Commands
```bash
cd backend
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm run test        # Run tests
```

### Frontend Commands
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## Environment Variables

### Backend (.env)
```env
# Database Configuration
DB_SERVER=your-server.database.windows.net
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
PORT=5000

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Email Alerts (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL_RECIPIENTS=admin@mess.com,manager@mess.com
```

## 🤖 AI Features Usage

### For Students
1. **Submit Feedback**: Write detailed comments about your meal experience
2. **Automatic Analysis**: AI instantly analyzes your feedback for sentiment and issues
3. **Priority Detection**: Critical issues (health/safety) are automatically flagged

### For Administrators
1. **AI Insights Dashboard**: View intelligent analysis of all feedback
2. **Real-time Alerts**: Get instant notifications for urgent issues
3. **Priority Management**: Focus on high-priority feedback first
4. **Trend Analysis**: Understand patterns and improve mess operations

### AI Analysis Features
- **Sentiment Analysis**: Positive, Neutral, Negative classification
- **Category Detection**: Food Quality, Service, Hygiene, Health Safety, etc.
- **Priority Scoring**: 1-10 scale with automatic urgency levels
- **Health & Safety Flagging**: Automatic detection of serious concerns
- **Smart Recommendations**: AI-generated action items for management

## Project Structure
```
├── backend/                 # Node.js/Express server
│   ├── src/
│   │   ├── services/       # AI services (Gemini, Alerts)
│   │   ├── routes/         # API endpoints (including admin AI routes)
│   │   ├── auth.ts         # Authentication logic
│   │   ├── database.ts     # Database connection
│   │   └── models.ts       # Database models (enhanced with AI fields)
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components (including AI dashboard)
│   │   │   ├── AIInsights.tsx      # AI-powered insights component
│   │   │   ├── EnhancedAdminDashboard.tsx  # Enhanced admin interface
│   │   │   └── ...
│   │   └── ...
│   └── package.json
└── README.md
```

## Troubleshooting

### Common Issues
1. **Database Connection Error**: Verify your Azure SQL Database credentials in `.env`
2. **Port Already in Use**: Change the PORT in backend `.env` file
3. **Module Not Found**: Run `npm install` in the respective directory
4. **Gemini API Error**: Ensure your `GEMINI_API_KEY` is valid and has sufficient quota
5. **AI Analysis Not Working**: Check if Gemini API key is properly set in `.env`
6. **Real-time Alerts Not Working**: Ensure Socket.IO is properly connected

### Getting Help
- Check the console for error messages
- Ensure all dependencies are installed
- Verify environment variables are set correctly

## Contributing
1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request
