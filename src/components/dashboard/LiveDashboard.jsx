import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import './LiveDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
);

const LiveDashboard = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    totalRequests: 0,
    responseTime: 0,
    errorRate: 0,
    systemLoad: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkIO: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef(null);
  const metricsHistory = useRef([]);

  // Simulate WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      setConnectionStatus('connected');

      // Simulate real-time data updates
      const interval = setInterval(() => {
        const newMetrics = {
          activeUsers: Math.floor(Math.random() * 1000) + 100,
          totalRequests: Math.floor(Math.random() * 10000) + 5000,
          responseTime: Math.floor(Math.random() * 200) + 50,
          errorRate: Math.random() * 5,
          systemLoad: Math.random() * 100,
          memoryUsage: Math.random() * 80 + 20,
          diskUsage: Math.random() * 60 + 30,
          networkIO: Math.random() * 1000 + 200,
        };

        setMetrics(newMetrics);

        // Update chart data
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        metricsHistory.current.push({
          time: timeLabel,
          ...newMetrics,
        });

        // Keep only last 20 data points
        if (metricsHistory.current.length > 20) {
          metricsHistory.current.shift();
        }

        setChartData({
          labels: metricsHistory.current.map((item) => item.time),
          datasets: [
            {
              label: 'Response Time (ms)',
              data: metricsHistory.current.map((item) => item.responseTime),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.4,
            },
            {
              label: 'Active Users',
              data: metricsHistory.current.map((item) => item.activeUsers / 10),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              tension: 0.4,
            },
          ],
        });
      }, 2000);

      return () => clearInterval(interval);
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  const statusIndicator = (status) => {
    const colors = {
      connecting: '#fbbf24',
      connected: '#10b981',
      disconnected: '#ef4444',
    };

    return (
      <div className="status-indicator">
        <div className="status-dot" style={{ backgroundColor: colors[status] }} />
        <span className="status-text">{status === 'connected' ? 'Live' : status}</span>
      </div>
    );
  };

  const MetricCard = ({ title, value, unit, trend, icon, color }) => (
    <div className="metric-card" style={{ borderColor: color }}>
      <div className="metric-header">
        <div className="metric-icon" style={{ color }}>
          {icon}
        </div>
        <h3 className="metric-title">{title}</h3>
      </div>
      <div className="metric-content">
        <div className="metric-value">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span className="metric-unit">{unit}</span>
        </div>
        {trend && (
          <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );

  const systemMetrics = [
    {
      title: 'Active Users',
      value: metrics.activeUsers,
      unit: '',
      icon: '👥',
      color: '#3b82f6',
      trend: Math.random() * 10 - 5,
    },
    {
      title: 'Total Requests',
      value: metrics.totalRequests,
      unit: '',
      icon: '📊',
      color: '#10b981',
      trend: Math.random() * 15,
    },
    {
      title: 'Response Time',
      value: Math.round(metrics.responseTime),
      unit: 'ms',
      icon: '⚡',
      color: '#f59e0b',
      trend: Math.random() * 8 - 4,
    },
    {
      title: 'Error Rate',
      value: metrics.errorRate.toFixed(2),
      unit: '%',
      icon: '🚨',
      color: '#ef4444',
      trend: Math.random() * -5,
    },
  ];

  const performanceData = {
    labels: ['CPU', 'Memory', 'Disk', 'Network'],
    datasets: [
      {
        data: [metrics.systemLoad, metrics.memoryUsage, metrics.diskUsage, metrics.networkIO / 10],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="live-dashboard">
      <div className="dashboard-header">
        <h1>🚀 Live Dashboard v3.0</h1>
        <div className="dashboard-controls">
          {statusIndicator(connectionStatus)}
          <div className="last-update">Last update: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="metrics-grid">
        {systemMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>📈 Real-time Performance</h3>
          <div className="chart-wrapper">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 750,
                  easing: 'easeInOutQuart',
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'white',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>⚙️ System Resources</h3>
          <div className="chart-wrapper">
            <Doughnut
              data={performanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'white',
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="activity-feed">
        <h3>📝 Live Activity Feed</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">{new Date().toLocaleTimeString()}</span>
            <span className="activity-message">New user connected from Vietnam</span>
            <span className="activity-badge success">+1</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">
              {new Date(Date.now() - 30000).toLocaleTimeString()}
            </span>
            <span className="activity-message">Google Sheets sync completed</span>
            <span className="activity-badge info">✓</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">
              {new Date(Date.now() - 60000).toLocaleTimeString()}
            </span>
            <span className="activity-message">Report generated successfully</span>
            <span className="activity-badge success">📊</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">
              {new Date(Date.now() - 90000).toLocaleTimeString()}
            </span>
            <span className="activity-message">Backend optimization deployed</span>
            <span className="activity-badge info">🚀</span>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="footer-info">
          <span>🔄 Auto-refresh: Every 2 seconds</span>
          <span>📡 WebSocket: {connectionStatus}</span>
          <span>⚡ Real-time: Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
