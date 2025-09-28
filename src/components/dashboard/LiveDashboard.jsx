import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { connectWebSocket, updateMetrics } from '../../store/slices/dashboardSlice';
import './LiveDashboard.css';

const LiveDashboard = () => {
  const dispatch = useDispatch();
  const { connectionStatus, realTimeData, metrics, isLoading, error } = useSelector(state => state.dashboard);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Kết nối WebSocket
    dispatch(connectWebSocket());

    // Cập nhật thời gian mỗi giây
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate metrics updates
    const metricsInterval = setInterval(() => {
      dispatch(updateMetrics({
        activeConnections: Math.floor(Math.random() * 100) + 10,
        averageResponseTime: Math.floor(Math.random() * 500) + 100,
        uptime: Date.now() - (Date.now() - 3600000) // 1 hour uptime
      }));
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(metricsInterval);
    };
  }, [dispatch]);

  const formatTime = (date) => {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatUptime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = realTimeData.slice(0, 20).reverse().map((item, index) => ({
    time: index,
    value: item.value,
    timestamp: new Date(item.timestamp).toLocaleTimeString('vi-VN')
  }));

  return (
    <div className="live-dashboard">
      <div className="dashboard-header">
        <h1>📊 Live Dashboard</h1>
        <div className="header-info">
          <span className="current-time">{formatTime(currentTime)}</span>
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ Lỗi: {error}</span>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Tổng Request</h3>
            <p className="metric-value">{metrics.totalRequests}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔗</div>
          <div className="metric-content">
            <h3>Kết nối đang hoạt động</h3>
            <p className="metric-value">{metrics.activeConnections}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>Thời gian phản hồi TB</h3>
            <p className="metric-value">{metrics.averageResponseTime}ms</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>Thời gian hoạt động</h3>
            <p className="metric-value">{formatUptime(metrics.uptime)}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>📊 Dữ liệu thời gian thực</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip
                labelFormatter={(value, payload) => `Thời gian: ${payload[0]?.payload?.timestamp}`}
                formatter={(value) => [`${value}`, 'Giá trị']}
              />
              <Line type="monotone" dataKey="value" stroke="#3498db" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>📊 Phân phối dữ liệu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip
                labelFormatter={(value, payload) => `Thời gian: ${payload[0]?.payload?.timestamp}`}
                formatter={(value) => [`${value}`, 'Giá trị']}
              />
              <Bar dataKey="value" fill="#2ecc71" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-data">
        <h3>🔄 Dữ liệu gần đây</h3>
        <div className="data-table">
          <div className="table-header">
            <span>Thời gian</span>
            <span>Giá trị</span>
            <span>Trạng thái</span>
          </div>
          {realTimeData.slice(0, 10).map((item, index) => (
            <div key={index} className="table-row">
              <span>{formatTime(new Date(item.timestamp))}</span>
              <span>{item.value.toFixed(2)}</span>
              <span className={`status ${item.status}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
