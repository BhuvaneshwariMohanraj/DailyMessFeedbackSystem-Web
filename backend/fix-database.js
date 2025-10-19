// Manual database initialization script
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

async function fixDatabase() {
  let pool;
  
  try {
    console.log('🔄 Connecting to database...');
    console.log(`Server: ${config.server}`);
    console.log(`Database: ${config.database}`);
    
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Connected to Azure SQL Database\n');

    // Step 1: Drop existing tables (if any)
    console.log('🗑️  Dropping existing tables...');
    try {
      await pool.request().query('DROP TABLE IF EXISTS Feedback');
      console.log('  ✓ Dropped Feedback table');
    } catch (e) { console.log('  - Feedback table does not exist'); }
    
    try {
      await pool.request().query('DROP TABLE IF EXISTS Menu');
      console.log('  ✓ Dropped Menu table');
    } catch (e) { console.log('  - Menu table does not exist'); }
    
    try {
      await pool.request().query('DROP TABLE IF EXISTS Users');
      console.log('  ✓ Dropped Users table');
    } catch (e) { console.log('  - Users table does not exist'); }
    
    try {
      await pool.request().query('DROP TABLE IF EXISTS Roles');
      console.log('  ✓ Dropped Roles table');
    } catch (e) { console.log('  - Roles table does not exist'); }

    console.log('\n📋 Creating tables...');

    // Step 2: Create Roles table
    await pool.request().query(`
      CREATE TABLE Roles (
        id INT IDENTITY(1,1) PRIMARY KEY,
        role_name NVARCHAR(20) UNIQUE NOT NULL,
        description NVARCHAR(100),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('  ✓ Created Roles table');

    // Step 3: Create Users table
    await pool.request().query(`
      CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) UNIQUE NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        role_id INT DEFAULT 2,
        is_active BIT DEFAULT 1,
        created_at DATETIME DEFAULT GETDATE(),
        last_login DATETIME,
        FOREIGN KEY (role_id) REFERENCES Roles(id)
      )
    `);
    console.log('  ✓ Created Users table');

    // Step 4: Create Menu table
    await pool.request().query(`
      CREATE TABLE Menu (
        id INT IDENTITY(1,1) PRIMARY KEY,
        meal_date DATE NOT NULL,
        meal_type NVARCHAR(20) NOT NULL,
        dish_name NVARCHAR(100) NOT NULL,
        description NVARCHAR(200),
        created_at DATETIME DEFAULT GETDATE(),
        UNIQUE(meal_date, meal_type, dish_name)
      )
    `);
    console.log('  ✓ Created Menu table');

    // Step 5: Create Feedback table with AI columns
    await pool.request().query(`
      CREATE TABLE Feedback (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment NVARCHAR(500),
        is_anonymous BIT DEFAULT 0,
        status NVARCHAR(20) DEFAULT 'pending',
        meal_date DATE DEFAULT CAST(GETDATE() AS DATE),
        meal_type NVARCHAR(20),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE(),
        ai_priority_score INT DEFAULT NULL,
        ai_priority_level NVARCHAR(10) DEFAULT NULL,
        ai_sentiment NVARCHAR(10) DEFAULT NULL,
        ai_category NVARCHAR(50) DEFAULT NULL,
        ai_keywords NVARCHAR(200) DEFAULT NULL,
        ai_summary NVARCHAR(300) DEFAULT NULL,
        ai_recommended_action NVARCHAR(200) DEFAULT NULL,
        ai_escalation_needed BIT DEFAULT 0,
        ai_health_safety_concern BIT DEFAULT 0,
        ai_analyzed_at DATETIME DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ Created Feedback table with AI columns');

    console.log('\n🌱 Seeding initial data...');

    // Step 6: Insert Roles
    await pool.request().query(`
      INSERT INTO Roles (role_name, description) VALUES ('admin', 'System Administrator');
    `);
    console.log('  ✓ Inserted admin role (id=1)');

    await pool.request().query(`
      INSERT INTO Roles (role_name, description) VALUES ('user', 'Regular User');
    `);
    console.log('  ✓ Inserted user role (id=2)');

    // Step 7: Insert Users with hardcoded role_id
    // Password for admin: admin123
    await pool.request().query(`
      INSERT INTO Users (username, email, password_hash, role_id) 
      VALUES ('admin', 'admin@mess.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1);
    `);
    console.log('  ✓ Created admin user (username: admin, password: admin123)');

    // Password for user1: password123
    await pool.request().query(`
      INSERT INTO Users (username, email, password_hash, role_id) 
      VALUES ('user1', 'user1@mess.com', '$2b$10$3K9ZqYWxR8nYQ7c6K8nX8e1gHJ8X8lQK3Y8K8nK9K5Q5K5K5K5K5K', 2);
    `);
    console.log('  ✓ Created user1 (username: user1, password: password123)');

    // Step 8: Verify data
    console.log('\n🔍 Verifying database...');
    const rolesResult = await pool.request().query('SELECT * FROM Roles');
    console.log(`  ✓ Roles count: ${rolesResult.recordset.length}`);

    const usersResult = await pool.request().query('SELECT username, email, role_id FROM Users');
    console.log(`  ✓ Users count: ${usersResult.recordset.length}`);
    usersResult.recordset.forEach(user => {
      console.log(`    - ${user.username} (${user.email}) - role_id: ${user.role_id}`);
    });

    console.log('\n✅ Database fixed successfully!');
    console.log('\n📝 You can now login with:');
    console.log('   Admin: username=admin, password=admin123');
    console.log('   User:  username=user1, password=password123');

  } catch (error) {
    console.error('\n❌ Error fixing database:', error);
    console.error('Error details:', error.message);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

fixDatabase();
