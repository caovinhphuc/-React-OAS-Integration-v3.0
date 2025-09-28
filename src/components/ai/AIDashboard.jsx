import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAIAnalysis, fetchAvailableModels, fetchPrediction, setAIServiceStatus } from '../../store/slices/aiSlice';
import './AIDashboard.css';

const AIDashboard = () => {
  const dispatch = useDispatch();
  const {
    analysisResults,
    predictions,
    availableModels,
    isLoading,
    isAnalyzing,
    error,
    aiServiceStatus
  } = useSelector(state => state.ai);

  const [selectedModel, setSelectedModel] = useState('prediction_model_v4');
  const [inputData, setInputData] = useState({
    feature1: Math.random() * 100,
    feature2: Math.random() * 100,
    feature3: Math.random() * 100
  });

  useEffect(() => {
    // Kiểm tra AI service status
    checkAIServiceStatus();
    // Load available models
    dispatch(fetchAvailableModels());
  }, [dispatch]);

  const checkAIServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        dispatch(setAIServiceStatus('connected'));
      } else {
        dispatch(setAIServiceStatus('disconnected'));
      }
    } catch (error) {
      dispatch(setAIServiceStatus('disconnected'));
    }
  };

  const handleAnalyze = () => {
    dispatch(fetchAIAnalysis(inputData));
  };

  const handlePredict = () => {
    dispatch(fetchPrediction(selectedModel));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const predictionChartData = Object.entries(predictions).map(([model, data]) => ({
    model: model.replace('_model_v4', ''),
    prediction: data.prediction,
    confidence: data.confidence * 100
  }));

  const confidenceData = [
    { name: 'Cao', value: analysisResults.filter(r => r.confidence > 0.8).length },
    { name: 'Trung bình', value: analysisResults.filter(r => r.confidence > 0.5 && r.confidence <= 0.8).length },
    { name: 'Thấp', value: analysisResults.filter(r => r.confidence <= 0.5).length }
  ];

  const COLORS = ['#2ecc71', '#f39c12', '#e74c3c'];

  return (
    <div className="ai-dashboard">
      <div className="dashboard-header">
        <h1>🧠 AI Analytics Dashboard</h1>
        <div className="header-info">
          <div className={`ai-status ${aiServiceStatus}`}>
            {aiServiceStatus === 'connected' ? '🟢 AI Service Connected' : '🔴 AI Service Disconnected'}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ Lỗi AI: {error}</span>
        </div>
      )}

      {/* AI Controls */}
      <div className="ai-controls">
        <div className="control-panel">
          <h3>🎯 AI Analysis Controls</h3>

          <div className="input-group">
            <label>Feature 1:</label>
            <input
              type="number"
              value={inputData.feature1}
              onChange={(e) => setInputData({...inputData, feature1: parseFloat(e.target.value)})}
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label>Feature 2:</label>
            <input
              type="number"
              value={inputData.feature2}
              onChange={(e) => setInputData({...inputData, feature2: parseFloat(e.target.value)})}
              step="0.1"
            />
          </div>

          <div className="input-group">
            <label>Feature 3:</label>
            <input
              type="number"
              value={inputData.feature3}
              onChange={(e) => setInputData({...inputData, feature3: parseFloat(e.target.value)})}
              step="0.1"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="analyze-btn"
          >
            {isAnalyzing ? '🔄 Đang phân tích...' : '🧠 Phân tích AI'}
          </button>
        </div>

        <div className="control-panel">
          <h3>🔮 Prediction Controls</h3>

          <div className="input-group">
            <label>Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {availableModels.map((model, index) => (
                <option key={index} value={model.name}>
                  {model.name} ({model.type}) - Accuracy: {(model.accuracy * 100).toFixed(1)}%
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePredict}
            disabled={isLoading}
            className="predict-btn"
          >
            {isLoading ? '🔄 Đang dự đoán...' : '🔮 Dự đoán'}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🧠</div>
          <div className="metric-content">
            <h3>Tổng phân tích</h3>
            <p className="metric-value">{analysisResults.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔮</div>
          <div className="metric-content">
            <h3>Dự đoán đã thực hiện</h3>
            <p className="metric-value">{Object.keys(predictions).length}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h3>Models có sẵn</h3>
            <p className="metric-value">{availableModels.length}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-content">
            <h3>Confidence TB</h3>
            <p className="metric-value">
              {analysisResults.length > 0
                ? (analysisResults.reduce((sum, r) => sum + r.confidence, 0) / analysisResults.length * 100).toFixed(1) + '%'
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>🔮 Predictions Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => `Model: ${value}`}
                formatter={(value, name) => [value, name === 'prediction' ? 'Dự đoán' : 'Confidence']}
              />
              <Line type="monotone" dataKey="prediction" stroke="#3498db" strokeWidth={2} />
              <Line type="monotone" dataKey="confidence" stroke="#e74c3c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>📊 Confidence Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={confidenceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Analysis Results */}
      <div className="recent-analysis">
        <h3>🔄 Kết quả phân tích gần đây</h3>
        <div className="analysis-table">
          <div className="table-header">
            <span>Thời gian</span>
            <span>Dự đoán</span>
            <span>Confidence</span>
            <span>Loại</span>
          </div>
          {analysisResults.slice(0, 10).map((result, index) => (
            <div key={index} className="table-row">
              <span>{formatTime(result.timestamp)}</span>
              <span>{result.prediction.toFixed(2)}</span>
              <span className={`confidence ${result.confidence > 0.8 ? 'high' : result.confidence > 0.5 ? 'medium' : 'low'}`}>
                {(result.confidence * 100).toFixed(1)}%
              </span>
              <span>{result.analysis_type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
