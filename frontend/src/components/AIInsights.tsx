import { useState, useEffect } from 'react';
import config from '../config';

interface AIInsightsProps {
  user: any;
}

interface Alert {
  id: number;
  priority_score: number;
  priority_level: string;
  category: string;
  summary: string;
  meal_type: string;
  urgency_level: string;
  time_since_created: number;
  health_safety_concern: boolean;
}

const AIInsights = ({ user }: AIInsightsProps) => {
  const [insights, setInsights] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    fetchInsights();
    fetchAlerts();
  }, [timeframe]);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${config.apiUrl}/api/admin/insights?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        console.error('Failed to fetch insights');
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${config.apiUrl}/api/admin/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'URGENT': return 'text-red-600 bg-red-100 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  const getPriorityIcon = (level: string) => {
    switch (level) {
      case 'URGENT': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MEDIUM': return '⚡';
      default: return '✅';
    }
  };

  const getActionableInsights = () => {
    if (!insights?.stats) return [];
    
    const actionItems = [];
    const stats = insights.stats;
    
    if (stats.health_safety_concerns > 0) {
      actionItems.push({
        type: 'critical',
        icon: '🏥',
        title: 'Health & Safety Issues Detected',
        description: `${stats.health_safety_concerns} critical health concern(s) need immediate attention`,
        action: 'Review and address immediately',
        priority: 1
      });
    }
    
    if (stats.urgent_issues > 0) {
      actionItems.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Urgent Issues Require Action',
        description: `${stats.urgent_issues} high-priority issue(s) reported`,
        action: 'Investigate and respond within 2 hours',
        priority: 2
      });
    }
    
    if (parseFloat(stats.average_rating) < 2.5) {
      actionItems.push({
        type: 'warning',
        icon: '📉',
        title: 'Low Average Rating Alert',
        description: `Average rating is ${stats.average_rating}/5 - below acceptable threshold`,
        action: 'Review recent feedback and improve service quality',
        priority: 3
      });
    }
    
    if (stats.sentiment_breakdown.negative > stats.sentiment_breakdown.positive) {
      actionItems.push({
        type: 'warning',
        icon: '😞',
        title: 'Negative Sentiment Trend',
        description: `${stats.sentiment_breakdown.negative} negative vs ${stats.sentiment_breakdown.positive} positive feedback`,
        action: 'Address common complaints and improve student satisfaction',
        priority: 4
      });
    }
    
    return actionItems.sort((a, b) => a.priority - b.priority);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">🤖 AI is analyzing feedback data...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No AI Insights Available</h3>
        <p className="text-gray-500 mb-4">Submit some feedback to see AI-powered analysis</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> The AI analyzes feedback for priority, sentiment, and safety concerns automatically
          </p>
        </div>
      </div>
    );
  }

  const stats = insights.stats;
  const actionItems = getActionableInsights();

  return (
    <div className="space-y-6">
      {/* Header with timeframe selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 AI-Powered Insights</h2>
          <p className="text-gray-600">AI-powered feedback analysis and alerts</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Action Items - What Needs Attention */}
      {actionItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🚨</span>
            <h3 className="text-lg font-semibold text-red-800">Issues Requiring Immediate Attention</h3>
          </div>
          <div className="space-y-3">
            {actionItems.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                item.type === 'critical' ? 'bg-red-50 border-red-500' :
                item.type === 'urgent' ? 'bg-orange-50 border-orange-500' :
                'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-start">
                  <span className="text-2xl mr-3 mt-1">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-700 text-sm mb-2">{item.description}</p>
                    <div className="bg-white px-3 py-2 rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-800">
                        📋 <strong>Recommended Action:</strong> {item.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_feedback}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
              <p className="text-2xl font-bold text-red-600">{stats.urgent_issues}</p>
            </div>
          </div>
          {stats.urgent_issues > 0 && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚡ Requires immediate action
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🏥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Health Concerns</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.health_safety_concerns}</p>
            </div>
          </div>
          {stats.health_safety_concerns > 0 && (
            <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              🏥 Critical safety issues
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.average_rating}/5</p>
            </div>
          </div>
          {parseFloat(stats.average_rating) < 2.5 && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              📉 Below acceptable threshold
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">😊 Sentiment Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-2xl font-bold text-green-600">{stats.sentiment_breakdown.positive}</div>
            <div className="text-sm text-gray-600">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">😐</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.sentiment_breakdown.neutral}</div>
            <div className="text-sm text-gray-600">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">😞</div>
            <div className="text-2xl font-bold text-red-600">{stats.sentiment_breakdown.negative}</div>
            <div className="text-sm text-gray-600">Negative</div>
          </div>
        </div>
      </div>

      {/* Issue Categories */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Issue Categories</h3>
        <div className="space-y-3">
          {Object.entries(stats.category_breakdown).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-gray-700">{category}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(count as number / stats.total_feedback) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count as number}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Generated Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">🧠</span>
          <h3 className="text-lg font-semibold text-purple-800">AI-Generated Insights</h3>
        </div>
        {insights.ai_insights ? (
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <p className="text-gray-700">{insights.ai_insights}</p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <p className="text-gray-600 italic">
              🤖 AI is processing feedback patterns to generate insights. More data needed for comprehensive analysis.
            </p>
            <div className="mt-3 text-sm text-purple-700 bg-purple-50 p-3 rounded">
              <strong>💡 How AI Insights Work:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Analyzes feedback patterns and trends</li>
                <li>Identifies recurring issues and root causes</li>
                <li>Suggests actionable improvements</li>
                <li>Predicts potential problems before they escalate</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
