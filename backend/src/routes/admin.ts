import * as express from 'express';
import { AuthService } from '../auth';
import { getPool } from '../database';
import geminiService from '../services/geminiService';
import alertService from '../services/alertService';

const router = express.Router();

// Middleware to check admin role
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const result = await dbPool.request()
      .input('userId', req.user.userId)
      .query(`
        SELECT r.role_name 
        FROM Users u 
        JOIN Roles r ON u.role_id = r.id 
        WHERE u.id = @userId
      `);

    if (!result.recordset.length || result.recordset[0].role_name !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin access' });
  }
};

// Get AI-powered dashboard insights
router.get('/insights', AuthService.authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { timeframe = 'week' } = req.query;
    let dateFilter = '';
    
    switch (timeframe) {
      case 'today':
        dateFilter = "AND meal_date = CAST(GETDATE() AS DATE)";
        break;
      case 'week':
        dateFilter = "AND meal_date >= DATEADD(day, -7, CAST(GETDATE() AS DATE))";
        break;
      case 'month':
        dateFilter = "AND meal_date >= DATEADD(month, -1, CAST(GETDATE() AS DATE))";
        break;
    }

    // Get feedback with AI analysis
    const feedbackResult = await dbPool.request().query(`
      SELECT 
        id, rating, comment, meal_type, meal_date,
        ai_priority_score, ai_priority_level, ai_sentiment, ai_category,
        ai_summary, ai_recommended_action, ai_health_safety_concern,
        created_at
      FROM Feedback 
      WHERE comment IS NOT NULL 
        AND ai_analyzed_at IS NOT NULL 
        ${dateFilter}
      ORDER BY ai_priority_score DESC, created_at DESC
    `);

    const feedback = feedbackResult.recordset;

    // Calculate statistics
    const stats = {
      total_feedback: feedback.length,
      urgent_issues: feedback.filter(f => f.ai_priority_level === 'URGENT').length,
      high_priority: feedback.filter(f => f.ai_priority_level === 'HIGH').length,
      health_safety_concerns: feedback.filter(f => f.ai_health_safety_concern).length,
      average_rating: feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : 0,
      sentiment_breakdown: {
        positive: feedback.filter(f => f.ai_sentiment === 'positive').length,
        neutral: feedback.filter(f => f.ai_sentiment === 'neutral').length,
        negative: feedback.filter(f => f.ai_sentiment === 'negative').length
      },
      category_breakdown: feedback.reduce((acc: any, f) => {
        if (f.ai_category) {
          acc[f.ai_category] = (acc[f.ai_category] || 0) + 1;
        }
        return acc;
      }, {})
    };

    // Generate AI insights
    let aiInsights = '';
    if (feedback.length > 0) {
      try {
        aiInsights = await geminiService.generateInsights(feedback);
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
        aiInsights = 'AI insights temporarily unavailable.';
      }
    }

    res.json({
      timeframe,
      stats,
      ai_insights: aiInsights,
      recent_urgent_feedback: feedback.filter(f => f.ai_priority_score >= 8).slice(0, 10),
      trends: {
        daily_ratings: [], // Could be populated with daily aggregates
        category_trends: [], // Could be populated with category trends over time
      }
    });

  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Get urgent alerts that need attention
router.get('/alerts', AuthService.authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const result = await dbPool.request().query(`
      SELECT 
        id, rating, comment, meal_type, meal_date,
        ai_priority_score, ai_priority_level, ai_category,
        ai_summary, ai_recommended_action, ai_health_safety_concern,
        created_at, status
      FROM Feedback 
      WHERE ai_priority_score >= 7 
        AND status IN ('pending', 'processing')
        AND meal_date >= DATEADD(day, -7, CAST(GETDATE() AS DATE))
      ORDER BY ai_priority_score DESC, created_at DESC
    `);

    const alerts = result.recordset.map((alert: any) => ({
      ...alert,
      urgency_level: alert.ai_priority_score >= 9 ? 'critical' : 'high',
      time_since_created: Math.floor((Date.now() - new Date(alert.created_at).getTime()) / (1000 * 60)), // minutes
    }));

    res.json({
      total_alerts: alerts.length,
      critical_alerts: alerts.filter(a => a.urgency_level === 'critical').length,
      alerts
    });

  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Update feedback status (mark as resolved, etc.)
router.patch('/feedback/:id/status', AuthService.authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { id } = req.params;
    const { status, admin_response } = req.body;

    if (!['pending', 'processing', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await dbPool.request()
      .input('feedbackId', id)
      .input('status', status)
      .input('adminResponse', admin_response || null)
      .input('updatedAt', new Date())
      .query(`
        UPDATE Feedback 
        SET status = @status, 
            admin_response = @adminResponse,
            updated_at = @updatedAt
        WHERE id = @feedbackId
      `);

    res.json({ message: 'Feedback status updated successfully' });

  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get detailed feedback analytics
router.get('/analytics', AuthService.authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Get daily ratings trend
    const dailyTrends = await dbPool.request().query(`
      SELECT 
        meal_date,
        meal_type,
        AVG(CAST(rating AS FLOAT)) as avg_rating,
        COUNT(*) as feedback_count,
        SUM(CASE WHEN ai_priority_score >= 8 THEN 1 ELSE 0 END) as urgent_count
      FROM Feedback 
      WHERE meal_date >= DATEADD(day, -30, CAST(GETDATE() AS DATE))
      GROUP BY meal_date, meal_type
      ORDER BY meal_date DESC, meal_type
    `);

    // Get category analysis
    const categoryAnalysis = await dbPool.request().query(`
      SELECT 
        ai_category,
        COUNT(*) as count,
        AVG(CAST(rating AS FLOAT)) as avg_rating,
        SUM(CASE WHEN ai_priority_score >= 8 THEN 1 ELSE 0 END) as urgent_count
      FROM Feedback 
      WHERE ai_category IS NOT NULL 
        AND meal_date >= DATEADD(day, -30, CAST(GETDATE() AS DATE))
      GROUP BY ai_category
      ORDER BY count DESC
    `);

    res.json({
      daily_trends: dailyTrends.recordset,
      category_analysis: categoryAnalysis.recordset,
      generated_at: new Date()
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Test alert system
router.post('/test-alerts', AuthService.authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const result = await alertService.testAlerts();
    res.json(result);
  } catch (error) {
    console.error('Test alerts error:', error);
    res.status(500).json({ error: 'Failed to test alerts' });
  }
});

// Re-analyze feedback with AI (for existing feedback)
router.post('/reanalyze/:id', AuthService.authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const dbPool = getPool();
    if (!dbPool) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { id } = req.params;

    // Get feedback
    const feedbackResult = await dbPool.request()
      .input('feedbackId', id)
      .query('SELECT * FROM Feedback WHERE id = @feedbackId');

    if (!feedbackResult.recordset.length) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const feedback = feedbackResult.recordset[0];

    if (!feedback.comment) {
      return res.status(400).json({ error: 'No comment to analyze' });
    }

    // Perform AI analysis
    const analysis = await geminiService.analyzeFeedback(
      feedback.comment, 
      feedback.rating, 
      feedback.meal_type
    );

    // Update feedback with new analysis
    await dbPool.request()
      .input('feedbackId', id)
      .input('priorityScore', analysis.priority_score)
      .input('priorityLevel', analysis.priority_level)
      .input('sentiment', analysis.sentiment)
      .input('category', analysis.category)
      .input('keywords', JSON.stringify(analysis.keywords))
      .input('summary', analysis.summary)
      .input('recommendedAction', analysis.recommended_action)
      .input('escalationNeeded', analysis.escalation_needed ? 1 : 0)
      .input('healthSafetyConcern', analysis.health_safety_concern ? 1 : 0)
      .input('analyzedAt', new Date())
      .query(`
        UPDATE Feedback SET
          ai_priority_score = @priorityScore,
          ai_priority_level = @priorityLevel,
          ai_sentiment = @sentiment,
          ai_category = @category,
          ai_keywords = @keywords,
          ai_summary = @summary,
          ai_recommended_action = @recommendedAction,
          ai_escalation_needed = @escalationNeeded,
          ai_health_safety_concern = @healthSafetyConcern,
          ai_analyzed_at = @analyzedAt
        WHERE id = @feedbackId
      `);

    res.json({
      message: 'Feedback re-analyzed successfully',
      analysis
    });

  } catch (error) {
    console.error('Re-analysis error:', error);
    res.status(500).json({ error: 'Failed to re-analyze feedback' });
  }
});

export default router;
