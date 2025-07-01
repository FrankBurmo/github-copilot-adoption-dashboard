import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Types for the Copilot metrics API response
interface CodeLanguage {
  name: string;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
}

interface Model {
  name: string;
  languages?: CodeLanguage[];
  total_chats?: number;
  is_custom_model?: boolean;
  total_engaged_users?: number;
  total_chat_copy_events?: number;
  total_chat_insertion_events?: number;
}

interface Editor {
  name: string;
  models: Model[];
  total_engaged_users: number;
}

interface CopilotIdeCodeCompletions {
  editors: Editor[];
}

interface CopilotIdeChat {
  editors: Editor[];
  total_engaged_users: number;
}

interface CopilotDotcomChat {
  total_engaged_users: number;
}

interface CopilotDotcomPullRequests {
  total_engaged_users: number;
}

interface DailyMetrics {
  date: string;
  copilot_ide_chat: CopilotIdeChat;
  total_active_users: number;
  copilot_dotcom_chat: CopilotDotcomChat;
  total_engaged_users: number;
  copilot_dotcom_pull_requests: CopilotDotcomPullRequests;
  copilot_ide_code_completions: CopilotIdeCodeCompletions;
}

// Simplified metrics interface for display purposes
interface DisplayMetrics {
  total_seats: number; // We don't have this in API, will estimate
  total_active_users: number;
  total_engaged_users: number;
  historical_data: {
    dates: string[];
    engaged_users: number[];
  };
  breakdown: {
    language: string;
    editor: string;
    suggestions_count: number;
    acceptances_count: number;
    lines_suggested: number;
    lines_accepted: number;
    active_users: number;
  }[];
}

interface ErrorResponse {
  message: string;
  documentation_url?: string;
}

const App: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [enterprise, setEnterprise] = useState<string>('');
  const [metrics, setMetrics] = useState<DisplayMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const processMetricsData = (data: DailyMetrics[]): DisplayMetrics => {
    // Get the latest day's data - using the last item as it's the most recent
    const latestDay = data[data.length - 1]; // Data is in chronological order (oldest first)
    
    // Process historical data - collect dates and engaged users
    const historicalData = {
      dates: data.map(day => day.date), // Already in chronological order (left to right)
      engaged_users: data.map(day => day.total_engaged_users)
    };
    
    // Initialize breakdown array
    const breakdown: DisplayMetrics['breakdown'] = [];
    
    // Process code completions data
    latestDay.copilot_ide_code_completions.editors.forEach(editor => {
      editor.models.forEach(model => {
        if (model.languages) {
          model.languages.forEach(lang => {
            breakdown.push({
              language: lang.name,
              editor: editor.name,
              suggestions_count: lang.total_code_suggestions,
              acceptances_count: lang.total_code_acceptances,
              lines_suggested: lang.total_code_lines_suggested,
              lines_accepted: lang.total_code_lines_accepted,
              active_users: lang.total_engaged_users
            });
          });
        }
      });
    });
    
    // Sort the breakdown data by active users (desc), then by accept rate (desc)
    breakdown.sort((a, b) => {
      // Calculate accept rates for both items
      const acceptRateA = a.suggestions_count > 0 ? (a.acceptances_count / a.suggestions_count) : 0;
      const acceptRateB = b.suggestions_count > 0 ? (b.acceptances_count / b.suggestions_count) : 0;
      
      // First sort by active users (descending)
      if (b.active_users !== a.active_users) {
        return b.active_users - a.active_users;
      }
      
      // Then sort by accept rate (descending)
      return acceptRateB - acceptRateA;
    });
    
    // Estimate total seats based on active users (could be adjusted)
    // For now, we'll use active users * 1.2 as an estimate
    const estimated_total_seats = Math.round(latestDay.total_active_users * 1.2);
    
    return {
      total_seats: estimated_total_seats,
      total_active_users: latestDay.total_active_users,
      total_engaged_users: latestDay.total_engaged_users,
      historical_data: historicalData,
      breakdown: breakdown
    };
  };

  const fetchMetrics = async () => {
    if (!token || !enterprise) {
      setError('Please provide both GitHub token and enterprise name');
      return;
    }

    setLoading(true);
    setError('');
    setMetrics(null);

    try {
      const response = await fetch(`https://api.github.com/enterprises/${enterprise}/copilot/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: DailyMetrics[] = await response.json();
      
      if (data && data.length > 0) {
        const processedMetrics = processMetricsData(data);
        setMetrics(processedMetrics);
      } else {
        throw new Error('No metrics data available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMetrics();
  };



  return (
    <div className="container">
      <div className="header">
        <h1>GitHub Copilot Metrics</h1>
        <p>Track GitHub Copilot adoption metrics for your enterprise</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="token">GitHub Token:</label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your GitHub personal access token"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="enterprise">Enterprise:</label>
            <input
              type="text"
              id="enterprise"
              value={enterprise}
              onChange={(e) => setEnterprise(e.target.value)}
              placeholder="Enter GitHub enterprise name"
              required
            />
          </div>          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Fetching...' : 'Get Metrics'}
          </button>
        </form>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Loading metrics...</p>
        </div>
      )}

      {metrics && (
        <div className="metrics-container">
          <div className="historical-chart-section">
            <h2>Historical Engagement Trend</h2>
            <p className="chart-description">
              This chart shows the daily trend of total engaged users. Engaged users are those who actively used Copilot features.
            </p>
            <div className="chart-container">
              <Line 
                data={{
                  labels: metrics.historical_data.dates,
                  datasets: [
                    {
                      label: 'Total Engaged Users',
                      data: metrics.historical_data.engaged_users,
                      borderColor: '#0366d6',
                      backgroundColor: 'rgba(3, 102, 214, 0.1)',
                      pointBackgroundColor: '#0366d6',
                      pointBorderColor: '#fff',
                      pointRadius: 5,
                      pointHoverRadius: 7,
                      fill: true,
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        title: function(tooltipItems) {
                          return 'Date: ' + tooltipItems[0].label;
                        },
                        label: function(context) {
                          return 'Engaged Users: ' + context.raw;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Users',
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Date',
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <h2>Copilot Usage Metrics</h2>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Seats</h3>
              <p className="value">{metrics.total_seats}</p>
            </div>
            <div className="metric-card">
              <h3>Active Users</h3>
              <p className="value">{metrics.total_active_users}</p>
            </div>
            <div className="metric-card">
              <h3>Engaged Users</h3>
              <p className="value">{metrics.total_engaged_users}</p>
            </div>
            <div className="metric-card">
              <h3>Engagement Rate</h3>
              <p className="value">
                {metrics.total_seats > 0 
                  ? Math.round((metrics.total_engaged_users / metrics.total_seats) * 100) 
                  : 0}%
              </p>
            </div>
          </div>

          {metrics.breakdown && metrics.breakdown.length > 0 && (
            <div>
              <h3>Usage Breakdown</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Language</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Editor</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Suggestions</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Acceptances</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Accept Rate</th>
                      <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Active Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.breakdown.map((item, index) => (
                      <tr key={index}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.language}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.editor}</td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                          {item.suggestions_count.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                          {item.acceptances_count.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                          {item.suggestions_count > 0 
                            ? Math.round((item.acceptances_count / item.suggestions_count) * 100) 
                            : 0}%
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                          {item.active_users}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;