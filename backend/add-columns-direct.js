// Directly add AI columns to the database
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function addAIColumns() {
  console.log('🔄 Adding AI columns to Feedback table...');

  try {
    const pool = await sql.connect(dbConfig);
    console.log('✅ Database connected');

    // Check existing columns
    const existingColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Feedback' 
      AND COLUMN_NAME LIKE 'ai_%'
    `);

    console.log(`📊 Found ${existingColumns.recordset.length} existing AI columns`);

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

    for (const sqlCommand of aiColumns) {
      try {
        await pool.request().query(sqlCommand);
        const columnName = sqlCommand.split('ADD ')[1].split(' ')[0];
        console.log(`✅ Added column: ${columnName}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          const columnName = sqlCommand.split('ADD ')[1].split(' ')[0];
          console.log(`⚠️ Column already exists: ${columnName}`);
        } else {
          console.error(`❌ Error adding column: ${error.message}`);
        }
      }
    }

    // Verify columns were added
    const newColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Feedback' 
      AND COLUMN_NAME LIKE 'ai_%'
      ORDER BY COLUMN_NAME
    `);

    console.log(`\n🎉 AI columns added successfully!`);
    console.log(`📊 Total AI columns: ${newColumns.recordset.length}`);
    newColumns.recordset.forEach(col => {
      console.log(`   ✅ ${col.COLUMN_NAME}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addAIColumns();
