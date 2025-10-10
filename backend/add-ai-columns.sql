-- SQL script to add AI columns to existing Feedback table
-- Run this in your Azure SQL Database query editor

-- Add AI analysis columns to Feedback table
ALTER TABLE Feedback ADD ai_priority_score INT DEFAULT NULL;
ALTER TABLE Feedback ADD ai_priority_level NVARCHAR(10) DEFAULT NULL;
ALTER TABLE Feedback ADD ai_sentiment NVARCHAR(10) DEFAULT NULL;
ALTER TABLE Feedback ADD ai_category NVARCHAR(50) DEFAULT NULL;
ALTER TABLE Feedback ADD ai_keywords NVARCHAR(200) DEFAULT NULL;
ALTER TABLE Feedback ADD ai_summary NVARCHAR(300) DEFAULT NULL;
ALTER TABLE Feedback ADD ai_recommended_action NVARCHAR(200) DEFAULT NULL;
ALTER TABLE Feedback ADD ai_escalation_needed BIT DEFAULT 0;
ALTER TABLE Feedback ADD ai_health_safety_concern BIT DEFAULT 0;
ALTER TABLE Feedback ADD ai_analyzed_at DATETIME DEFAULT NULL;

-- Add indexes for better performance
CREATE INDEX IX_Feedback_priority ON Feedback(ai_priority_score);
CREATE INDEX IX_Feedback_health_safety ON Feedback(ai_health_safety_concern);

-- Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Feedback' 
AND COLUMN_NAME LIKE 'ai_%'
ORDER BY COLUMN_NAME;
