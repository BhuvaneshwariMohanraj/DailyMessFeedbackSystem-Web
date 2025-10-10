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
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize Socket.IO for real-time alerts
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const newSocket = io(config.apiUrl, {
          transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
          console.log('🔌 Connected to real-time alerts');
          newSocket.emit('join-admin');
        });

        newSocket.on('urgent-alert', (alert: any) => {
          console.log('🚨 New urgent alert received:', alert);
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('🚨 Urgent Mess Issue!', {
              body: alert.message,
              icon: '/favicon.ico'
            });
          }
          
          // Refresh alerts
          fetchAlerts();
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();
    fetchInsights();
    fetchAlerts();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
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

  const updateFeedbackStatus = async (feedbackId: number, status: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${config.apiUrl}/api/admin/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchAlerts(); // Refresh alerts
        fetchInsights(); // Refresh insights
      }
    } catch (error) {
      console.error('Error updating status:', error);
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

  const formatTimeAgo = (minutes: number) => {
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
        action: 'Review and address immediately'
      });
    }
    
    if (stats.urgent_issues > 0) {
      actionItems.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Urgent Issues Require Action',
        description: `${stats.urgent_issues} high-priority issue(s) reported`,
        action: 'Investigate and respond within 2 hours'
      });
    }
    
    if (parseFloat(stats.average_rating) < 2.5) {
      actionItems.push({
        type: 'warning',
        icon: '📉',
        title: 'Low Average Rating Alert',
        description: `Average rating is ${stats.average_rating}/5 - below acceptable threshold`,
        action: 'Review recent feedback and improve service quality'
      });
    }
    
    if (stats.sentiment_breakdown.negative > stats.sentiment_breakdown.positive) {
      actionItems.push({
        type: 'warning',
        icon: '😞',
        title: 'Negative Sentiment Trend',
        description: `${stats.sentiment_breakdown.negative} negative vs ${stats.sentiment_breakdown.positive} positive feedback`,
        action: 'Address common complaints and improve student satisfaction'
      });
    }
    
    return actionItems;
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

  return (
    <div className="space-y-6">
          )}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Critical Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">
            🚨 Urgent Issues Requiring Attention ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="bg-white border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority_level)}`}>
                        {alert.priority_level} ({alert.priority_score}/10)
                      </span>
                      <span className="text-sm text-gray-500">{alert.category}</span>
                      <span className="text-sm text-gray-500">{alert.meal_type}</span>
                      {alert.health_safety_concern && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                          ⚠️ Health Risk
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 mb-2">{alert.summary}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(alert.time_since_created)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateFeedbackStatus(alert.id, 'processing')}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => updateFeedbackStatus(alert.id, 'resolved')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Statistics Dashboard */}
      {insights && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  📊
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-semibold text-gray-900">{insights.stats.total_feedback}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  🚨
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">{insights.stats.urgent_issues}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  ⚕️
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Health Concerns</p>
                  <p className="text-2xl font-semibold text-gray-900">{insights.stats.health_safety_concerns}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  ⭐
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-semibold text-gray-900">{insights.stats.average_rating}/5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">😊 Sentiment Analysis</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {insights.stats.sentiment_breakdown.positive}
                </div>
                <div className="text-sm text-gray-600">Positive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {insights.stats.sentiment_breakdown.neutral}
                </div>
                <div className="text-sm text-gray-600">Neutral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {insights.stats.sentiment_breakdown.negative}
                </div>
                <div className="text-sm text-gray-600">Negative</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Issue Categories</h3>
            <div className="space-y-3">
              {Object.entries(insights.stats.category_breakdown).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-gray-700">{category}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Generated Insights */}
          {insights.ai_insights && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 AI-Generated Insights</h3>
              <div className="prose prose-sm text-gray-700">
                {insights.ai_insights.split('\n').map((line: string, index: number) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIInsights;
