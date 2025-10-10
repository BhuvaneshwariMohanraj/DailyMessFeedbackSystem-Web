// Migration script to add AI columns to existing Feedback table
import { getPool } from './database';

async function addAIColumns() {
  try {
    const pool = getPool();
    if (!pool) {
      console.error('❌ Database not connected');
      return;
    }

    console.log('🔄 Adding AI columns to Feedback table...');

    // Check if columns already exist
    const checkColumns = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Feedback' 
      AND COLUMN_NAME LIKE 'ai_%'
    `);

    if (checkColumns.recordset.length > 0) {
      console.log('✅ AI columns already exist in the database');
      return;
    }

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
        console.log(`✅ Added column: ${sql.split('ADD ')[1].split(' ')[0]}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Column already exists: ${sql.split('ADD ')[1].split(' ')[0]}`);
        } else {
          console.error(`❌ Error adding column: ${error.message}`);
        }
      }
    }

    // Add indexes for better performance
    const indexes = [
      'CREATE INDEX IX_Feedback_priority ON Feedback(ai_priority_score)',
      'CREATE INDEX IX_Feedback_health_safety ON Feedback(ai_health_safety_concern)'
    ];

    for (const indexSql of indexes) {
      try {
        await pool.request().query(indexSql);
        console.log(`✅ Added index: ${indexSql.split('INDEX ')[1].split(' ')[0]}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Index already exists`);
        } else {
          console.error(`❌ Error adding index: ${error.message}`);
        }
      }
    }

    console.log('🎉 AI columns migration completed successfully!');
    console.log('📝 The Feedback table now supports AI analysis features');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
addAIColumns();
