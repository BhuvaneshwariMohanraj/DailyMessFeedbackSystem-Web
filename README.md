# Daily Mess Feedback System

A full-stack web application for collecting and managing daily feedback on mess meals and services.

## Tech Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, Vite, Tailwind CSS, Shadcn/ui
- **Database**: Azure SQL Database

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

# Edit .env file with your Azure SQL Database credentials
# Update the following variables:
# DB_SERVER=your-server.database.windows.net
# DB_NAME=your-database-name
# DB_USER=your-username
# DB_PASSWORD=your-password
# PORT=5000

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
DB_SERVER=your-server.database.windows.net
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
PORT=5000
```

## Project Structure
```
├── backend/                 # Node.js/Express server
│   ├── src/
│   │   ├── auth.ts         # Authentication logic
│   │   ├── database.ts     # Database connection
│   │   └── ...
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
└── README.md
```

## Troubleshooting

### Common Issues
1. **Database Connection Error**: Verify your Azure SQL Database credentials in `.env`
2. **Port Already in Use**: Change the PORT in backend `.env` file
3. **Module Not Found**: Run `npm install` in the respective directory

### Getting Help
- Check the console for error messages
- Ensure all dependencies are installed
- Verify environment variables are set correctly

## Contributing
1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request
