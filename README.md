# 🚀 React OAS Integration v3.0 - AI-Powered Platform

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/caovinhphuc/-React-OAS-Integration-v3.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)](https://python.org/)

## 📋 Tổng quan

React OAS Integration v3.0 là một nền tảng AI-powered hoàn chỉnh với các tính năng:

- 🌐 **Frontend React**: Giao diện người dùng hiện đại với routing và state management
- 📊 **Backend WebSocket**: Server thời gian thực với Socket.IO
- 🧠 **AI/ML Service**: Dịch vụ AI với FastAPI và machine learning
- 📊 **Google Sheets Integration**: Tích hợp quản lý dữ liệu từ Google Sheets
- 📈 **Live Dashboard**: Dashboard thời gian thực với biểu đồ và metrics

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Service    │
│   React App     │◄──►│   WebSocket     │◄──►│   FastAPI       │
│   Port: 8080    │    │   Port: 3001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Google Sheets   │
                    │ Integration     │
                    └─────────────────┘
```

## 🚀 Cài đặt và khởi chạy

### Yêu cầu hệ thống

- Node.js 18+
- Python 3.9+
- npm hoặc yarn
- Git

### Khởi chạy nhanh

```bash
# Clone repository
git clone https://github.com/caovinhphuc/-React-OAS-Integration-v3.0.git
cd -React-OAS-Integration-v3.0

# Khởi chạy tất cả services
./start_ai_platform.sh
```

### Khởi chạy từng service

```bash
# 1. Cài đặt dependencies
npm install
cd backend && npm install
cd ../ai-service && pip install -r requirements.txt

# 2. Khởi chạy Backend
cd backend && npm start

# 3. Khởi chạy AI Service
cd ai-service && python3 -m uvicorn main_simple:app --host 0.0.0.0 --port 8000

# 4. Build và serve Frontend
npm run build
npx serve -s build -l 8080
```

## 🌐 Truy cập ứng dụng

Sau khi khởi chạy thành công, truy cập:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/health
- **AI Service**: http://localhost:8000/health
- **Live Dashboard**: http://localhost:8080/dashboard
- **AI Analytics**: http://localhost:8080/ai-analytics
- **Google Sheets**: http://localhost:8080/google-sheets

## 📊 Tính năng chính

### 🏠 Home Dashboard
- Giao diện chính với navigation
- Thống kê hệ thống
- Quick links đến các tính năng

### 📈 Live Dashboard
- WebSocket real-time connection
- Biểu đồ thời gian thực
- Metrics và performance monitoring
- Data visualization với Recharts

### 🧠 AI Analytics
- AI-powered data analysis
- Machine learning predictions
- Confidence scoring
- Model management

### 📊 Google Sheets Integration
- Kết nối Google Sheets API
- Import/Export dữ liệu
- Real-time data synchronization
- CRUD operations

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18.2.0** - UI Framework
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Socket.IO** - WebSocket communication
- **CORS** - Cross-origin requests

### AI Service
- **Python 3.9+** - Programming language
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

### Development Tools
- **Concurrently** - Run multiple commands
- **Serve** - Static file serving
- **ESLint** - Code linting

## 📁 Cấu trúc thư mục

```
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── ai/                 # AI dashboard components
│   │   ├── common/             # Shared components
│   │   ├── dashboard/          # Live dashboard components
│   │   └── google/             # Google Sheets integration
│   ├── store/                  # Redux store
│   │   └── slices/            # Redux slices
│   └── App.jsx                # Main App component
├── backend/                    # Backend server
│   ├── server.js              # Main server file
│   └── package.json           # Backend dependencies
├── ai-service/                 # AI/ML service
│   ├── main_simple.py         # FastAPI application
│   └── requirements.txt       # Python dependencies
├── public/                     # Static files
├── build/                      # Production build
├── logs/                       # Application logs
└── start_ai_platform.sh       # Startup script
```

## 🔧 Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục gốc:

```env
# Backend Configuration
PORT=3001
NODE_ENV=production

# AI Service Configuration
AI_SERVICE_PORT=8000
AI_SERVICE_HOST=0.0.0.0

# Frontend Configuration
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_AI_SERVICE_URL=http://localhost:8000
```

### Google Sheets Integration

Để sử dụng Google Sheets integration:

1. Tạo project trên Google Cloud Console
2. Enable Google Sheets API
3. Tạo service account credentials
4. Download JSON credentials file
5. Cập nhật path trong config

## 📝 API Documentation

### Backend API

- `GET /health` - Health check
- `GET /api/status` - Service status
- `WebSocket /` - Real-time data updates

### AI Service API

- `GET /health` - Health check
- `GET /api/status` - Service status
- `POST /api/analyze` - AI data analysis
- `GET /api/predict/{model_type}` - Get predictions
- `GET /api/models` - List available models

## 🚀 Deployment

### Production Deployment

```bash
# Build production version
npm run build

# Start production services
NODE_ENV=production ./start_ai_platform.sh
```

### Docker Deployment

```bash
# Build Docker images
docker build -t react-oas-frontend .
docker build -t react-oas-backend ./backend
docker build -t react-oas-ai ./ai-service

# Run with Docker Compose
docker-compose up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports
   lsof -ti:3001,8000,8080 | xargs kill -9
   ```

2. **Python dependencies not found**
   ```bash
   # Install Python dependencies
   cd ai-service && pip install -r requirements.txt
   ```

3. **Node modules issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

Kiểm tra logs trong thư mục `logs/`:
- `frontend.log` - Frontend server logs
- `backend.log` - Backend server logs
- `ai-service.log` - AI service logs

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

- **GitHub Issues**: [Create an issue](https://github.com/caovinhphuc/-React-OAS-Integration-v3.0/issues)
- **Documentation**: [Wiki](https://github.com/caovinhphuc/-React-OAS-Integration-v3.0/wiki)

## 🙏 Acknowledgments

- React team for the amazing framework
- FastAPI team for the high-performance web framework
- Socket.IO team for real-time communication
- All contributors and supporters

---

**Made with ❤️ by [caovinhphuc](https://github.com/caovinhphuc)**
