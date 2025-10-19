-- SQL Script to Add Missing Columns to Feedback Table
-- Run this in your Azure SQL Database Query Editor
-- This script checks if columns exist before adding them

-- Add status column (if it doesn't exist)
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'status'
)
BEGIN
    ALTER TABLE Feedback ADD status NVARCHAR(20) DEFAULT 'pending';
    PRINT 'Added status column';
END
ELSE
BEGIN
    PRINT 'status column already exists';
END

-- Add ai_priority_score column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_priority_score'
)
BEGIN
    ALTER TABLE Feedback ADD ai_priority_score INT DEFAULT NULL;
    PRINT 'Added ai_priority_score column';
END
ELSE
BEGIN
    PRINT 'ai_priority_score column already exists';
END

-- Add ai_priority_level column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_priority_level'
)
BEGIN
    ALTER TABLE Feedback ADD ai_priority_level NVARCHAR(10) DEFAULT NULL;
    PRINT 'Added ai_priority_level column';
END
ELSE
BEGIN
    PRINT 'ai_priority_level column already exists';
END

-- Add ai_sentiment column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_sentiment'
)
BEGIN
    ALTER TABLE Feedback ADD ai_sentiment NVARCHAR(10) DEFAULT NULL;
    PRINT 'Added ai_sentiment column';
END
ELSE
BEGIN
    PRINT 'ai_sentiment column already exists';
END

-- Add ai_category column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_category'
)
BEGIN
    ALTER TABLE Feedback ADD ai_category NVARCHAR(50) DEFAULT NULL;
    PRINT 'Added ai_category column';
END
ELSE
BEGIN
    PRINT 'ai_category column already exists';
END

-- Add ai_keywords column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_keywords'
)
BEGIN
    ALTER TABLE Feedback ADD ai_keywords NVARCHAR(200) DEFAULT NULL;
    PRINT 'Added ai_keywords column';
END
ELSE
BEGIN
    PRINT 'ai_keywords column already exists';
END

-- Add ai_summary column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_summary'
)
BEGIN
    ALTER TABLE Feedback ADD ai_summary NVARCHAR(300) DEFAULT NULL;
    PRINT 'Added ai_summary column';
END
ELSE
BEGIN
    PRINT 'ai_summary column already exists';
END

-- Add ai_recommended_action column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_recommended_action'
)
BEGIN
    ALTER TABLE Feedback ADD ai_recommended_action NVARCHAR(200) DEFAULT NULL;
    PRINT 'Added ai_recommended_action column';
END
ELSE
BEGIN
    PRINT 'ai_recommended_action column already exists';
END

-- Add ai_escalation_needed column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_escalation_needed'
)
BEGIN
    ALTER TABLE Feedback ADD ai_escalation_needed BIT DEFAULT 0;
    PRINT 'Added ai_escalation_needed column';
END
ELSE
BEGIN
    PRINT 'ai_escalation_needed column already exists';
END

-- Add ai_health_safety_concern column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_health_safety_concern'
)
BEGIN
    ALTER TABLE Feedback ADD ai_health_safety_concern BIT DEFAULT 0;
    PRINT 'Added ai_health_safety_concern column';
END
ELSE
BEGIN
    PRINT 'ai_health_safety_concern column already exists';
END

-- Add ai_analyzed_at column
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Feedback' AND COLUMN_NAME = 'ai_analyzed_at'
)
BEGIN
    ALTER TABLE Feedback ADD ai_analyzed_at DATETIME DEFAULT NULL;
    PRINT 'Added ai_analyzed_at column';
END
ELSE
BEGIN
    PRINT 'ai_analyzed_at column already exists';
END

-- Verify all columns
PRINT '';
PRINT '=== Current Feedback Table Structure ===';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Feedback'
ORDER BY ORDINAL_POSITION;
