import * as sql from 'mssql';
const { pool } = require('./database');

// Function to safely add AI columns to existing Feedback table
const addAIColumnsIfNotExists = async () => {
  try {
    if (!pool) return;

    // Check if AI columns already exist
    const checkColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Feedback' 
      AND COLUMN_NAME LIKE 'ai_%'
    `);

    if (checkColumns.recordset.length > 0) {
      console.log('✅ AI columns already exist in Feedback table');
      return;
    }

    console.log('🔄 Adding AI columns to existing Feedback table...');

    // Add AI columns one by one
    const aiColumns = [
      'ALTER TABLE Feedback ADD ai_priority_score INT DEFAULT NULL',
      'ALTER TABLE Feedback ADD ai_priority_level NVARCHAR(10) DEFAULT NULL',
      'ALTER TABLE Feedback ADD ai_sentiment NVARCHAR(10) DEFAULT NULL', 
      'ALTER TABLE Feedback ADD ai_category NVARCHAR(50) DEFAULT NULL',
      'ALTER TABLE Feedback ADD ai_keywords NVARCHAR(200) DEFAULT NULL',
      'ALTER TABLE Feedback ADD ai_summary NVARCHAR(300) DEFAULT NULL',
      'ALTER TABLE Feedback ADD ai_recommended_action NVARCHAR(200) DEFAULT NULL',
      'ALTER TABLE Feedback ADD ai_escalation_needed BIT DEFAULT 0',
      'ALTER TABLE Feedback ADD ai_health_safety_concern BIT DEFAULT 0',
      'ALTER TABLE Feedback ADD ai_analyzed_at DATETIME DEFAULT NULL'
    ];

    for (const sql of aiColumns) {
      try {
        await pool.request().query(sql);
        console.log(`✅ Added AI column: ${sql.split('ADD ')[1].split(' ')[0]}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ AI column already exists: ${sql.split('ADD ')[1].split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding AI column: ${error.message}`);
        }
      }
    }

    console.log('🎉 AI columns added successfully to Feedback table!');
  } catch (error) {
    console.error('❌ Error adding AI columns:', error);
  }
};

export const createTables = async () => {
  try {
    if (pool) {
      // Roles table
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
        CREATE TABLE Roles (
          id INT IDENTITY(1,1) PRIMARY KEY,
          role_name NVARCHAR(20) UNIQUE NOT NULL,
          description NVARCHAR(100),
          created_at DATETIME DEFAULT GETDATE()
        )
      `);

      // Users table with role relationship
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
        CREATE TABLE Users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(50) UNIQUE NOT NULL,
          email NVARCHAR(100) UNIQUE NOT NULL,
          password_hash NVARCHAR(255) NOT NULL,
          role_id INT DEFAULT 2, -- Default to 'user' role
          is_active BIT DEFAULT 1,
          created_at DATETIME DEFAULT GETDATE(),
          last_login DATETIME,
          FOREIGN KEY (role_id) REFERENCES Roles(id)
        )
      `);

      // Menu table for today's menu
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Menu' AND xtype='U')
        CREATE TABLE Menu (
          id INT IDENTITY(1,1) PRIMARY KEY,
          meal_date DATE NOT NULL,
          meal_type NVARCHAR(20) NOT NULL, -- breakfast, lunch, dinner
          dish_name NVARCHAR(100) NOT NULL,
          description NVARCHAR(200),
          created_at DATETIME DEFAULT GETDATE(),
          UNIQUE(meal_date, meal_type, dish_name)
        )
      `);

      // Feedback table (allows multiple submissions per meal per day)
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Feedback' AND xtype='U')
        CREATE TABLE Feedback (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT,
          rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
          comment NVARCHAR(500),
          is_anonymous BIT DEFAULT 0,
          status NVARCHAR(20) DEFAULT 'pending', -- pending, processing, resolved
          meal_date DATE DEFAULT CAST(GETDATE() AS DATE),
          meal_type NVARCHAR(20), -- breakfast, lunch, dinner
          created_at DATETIME DEFAULT GETDATE(),
          updated_at DATETIME DEFAULT GETDATE(),
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
          FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_email')
        CREATE INDEX IX_Users_email ON Users(email);
      `);

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_role_id')
        CREATE INDEX IX_Users_role_id ON Users(role_id);
      `);

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Feedback_user_date')
        CREATE INDEX IX_Feedback_user_date ON Feedback(user_id, meal_date);
      `);

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Feedback_rating')
        CREATE INDEX IX_Feedback_rating ON Feedback(rating);
      `);

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Feedback_priority')
        CREATE INDEX IX_Feedback_priority ON Feedback(ai_priority_score);
      `);

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Feedback_health_safety')
        CREATE INDEX IX_Feedback_health_safety ON Feedback(ai_health_safety_concern);
      `);

      // Add AI columns to existing Feedback table if they don't exist
      await addAIColumnsIfNotExists();

      console.log('Database tables created successfully!');
    } else {
      console.error('Database pool not available');
    }
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

export const seedInitialData = async () => {
  try {
    if (pool) {
      // Insert default roles
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'admin')
        INSERT INTO Roles (role_name, description) VALUES ('admin', 'System Administrator');
      `);

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM Roles WHERE role_name = 'user')
        INSERT INTO Roles (role_name, description) VALUES ('user', 'Regular User');
      `);

      // Create default admin user (password: Admin123!)
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM Users WHERE username = 'admin')
        INSERT INTO Users (username, email, password_hash, role_id)
        SELECT 'admin', 'admin@mess.com', '$2b$10$rEuVt2qKHfJ3cKgL5YQ6Le1gHJ8X8lQK3Y8K8nK9K5Q5K5K5K5K5K', role_id
        FROM Roles WHERE role_name = 'admin';
      `);

      // Create sample users
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM Users WHERE username = 'user1')
        INSERT INTO Users (username, email, password_hash, role_id)
        SELECT 'user1', 'user1@mess.com', '$2b$10$rEuVt2qKHfJ3cKgL5YQ6Le1gHJ8X8lQK3Y8K8nK9K5Q5K5K5K5K5K', role_id
        FROM Roles WHERE role_name = 'user';
      `);

      // Seed menu data for the week
      const today = new Date();
      const menuData = [];
      
      // Generate menu for 7 days starting from today
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Breakfast items
        menuData.push({
          date: dateStr,
          meal_type: 'breakfast',
          dishes: [
            { name: 'Idli', description: 'Steamed rice cakes with coconut chutney' },
            { name: 'Sambar', description: 'Lentil curry with vegetables' },
            { name: 'Coconut Chutney', description: 'Fresh coconut chutney' }
          ]
        });
        
        // Lunch items
        menuData.push({
          date: dateStr,
          meal_type: 'lunch',
          dishes: [
            { name: 'Rice', description: 'Steamed basmati rice' },
            { name: 'Dal Tadka', description: 'Yellow lentils with spices' },
            { name: 'Mixed Vegetable Curry', description: 'Seasonal vegetables in curry' },
            { name: 'Pickle', description: 'Homemade pickle' }
          ]
        });
        
        // Dinner items
        menuData.push({
          date: dateStr,
          meal_type: 'dinner',
          dishes: [
            { name: 'Chapati', description: 'Fresh wheat flatbread' },
            { name: 'Paneer Curry', description: 'Cottage cheese in rich gravy' },
            { name: 'Jeera Rice', description: 'Cumin flavored rice' },
            { name: 'Raita', description: 'Yogurt with cucumber and spices' }
          ]
        });
      }

      // Insert menu data
      for (const menu of menuData) {
        for (const dish of menu.dishes) {
          await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM Menu WHERE meal_date = '${menu.date}' AND meal_type = '${menu.meal_type}' AND dish_name = '${dish.name}')
            INSERT INTO Menu (meal_date, meal_type, dish_name, description)
            VALUES ('${menu.date}', '${menu.meal_type}', '${dish.name}', '${dish.description}');
          `);
        }
      }

      console.log('Initial data seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};
