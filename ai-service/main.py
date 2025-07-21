"""
AI/ML Service for React OAS Integration v4.0
Intelligent Predictive Analytics & Machine Learning API
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import asyncio
from loguru import logger

# Import our ML modules
from models.predictor import PerformancePredictor
from models.anomaly_detector import AnomalyDetector
from models.optimizer import SystemOptimizer
from utils.data_processor import DataProcessor

# Initialize FastAPI app
app = FastAPI(
    title="React OAS Integration AI Service",
    description="Intelligent ML-powered analytics and predictions",
    version="4.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models
predictor = PerformancePredictor()
anomaly_detector = AnomalyDetector()
system_optimizer = SystemOptimizer()
data_processor = DataProcessor()

# Pydantic models for API
class MetricData(BaseModel):
    timestamp: datetime
    active_users: int
    response_time: float
    error_rate: float
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: float

class PredictionRequest(BaseModel):
    timeframe: str = "1h"  # 1h, 6h, 24h, 7d
    metrics: List[str] = ["response_time", "active_users", "cpu_usage"]

class PredictionResponse(BaseModel):
    predictions: Dict[str, List[float]]
    confidence_scores: Dict[str, float]
    insights: List[str]
    recommendations: List[str]

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "React OAS Integration AI Service",
        "version": "4.0.0",
        "status": "operational",
        "features": [
            "Predictive Analytics",
            "Anomaly Detection",
            "Performance Optimization",
            "Intelligent Insights"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check with ML model status"""
    try:
        # Safely check model status
        model_status = {}
        try:
            model_status["predictor"] = predictor.is_ready()
        except Exception:
            model_status["predictor"] = False

        try:
            model_status["anomaly_detector"] = anomaly_detector.is_ready()
        except Exception:
            model_status["anomaly_detector"] = False

        try:
            model_status["optimizer"] = system_optimizer.is_ready()
        except Exception:
            model_status["optimizer"] = False

        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "models": model_status,
            "uptime": "operational",
            "service": "React OAS Integration AI Service",
            "version": "4.0.0"
        }
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return {
            "status": "degraded",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "service": "React OAS Integration AI Service",
            "version": "4.0.0"
        }

@app.post("/api/ml/predict")
async def predict_performance(request: PredictionRequest):
    """Generate performance predictions using ML models"""
    try:
        # Get historical data (simulated for now)
        historical_data = data_processor.get_recent_metrics(hours=24)

        # Generate predictions
        predictions = {}
        confidence_scores = {}

        for metric in request.metrics:
            prediction_result = predictor.predict(
                metric=metric,
                data=historical_data,
                timeframe=request.timeframe
            )
            predictions[metric] = prediction_result["values"]
            confidence_scores[metric] = prediction_result["confidence"]

        # Generate insights
        insights = predictor.generate_insights(predictions, historical_data)
        recommendations = system_optimizer.get_recommendations(predictions)

        return PredictionResponse(
            predictions=predictions,
            confidence_scores=confidence_scores,
            insights=insights,
            recommendations=recommendations
        )

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/api/ml/anomaly-detection")
async def detect_anomalies(data: List[MetricData]):
    """Detect anomalies in real-time metrics"""
    try:
        # Convert to DataFrame
        df = pd.DataFrame([item.dict() for item in data])

        # Detect anomalies
        anomalies = anomaly_detector.detect(df)

        # Generate alerts
        alerts = anomaly_detector.generate_alerts(anomalies)

        return {
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies,
            "alerts": alerts,
            "severity_levels": anomaly_detector.assess_severity(anomalies),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@app.post("/api/ml/optimize")
async def optimize_system(current_metrics: MetricData):
    """Get AI-powered optimization recommendations"""
    try:
        # Analyze current performance
        analysis = system_optimizer.analyze_performance(current_metrics.dict())

        # Generate optimization suggestions
        optimizations = system_optimizer.suggest_optimizations(analysis)

        # Calculate impact predictions
        impact_predictions = system_optimizer.predict_impact(optimizations)

        return {
            "current_performance_score": analysis["score"],
            "optimization_suggestions": optimizations,
            "predicted_improvements": impact_predictions,
            "implementation_priority": system_optimizer.prioritize_optimizations(optimizations),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.get("/api/ml/insights")
async def get_intelligent_insights():
    """Get AI-generated insights and trends"""
    try:
        # Get recent performance data
        recent_data = data_processor.get_recent_metrics(hours=24)

        # Generate comprehensive insights
        insights = {
            "performance_trends": predictor.analyze_trends(recent_data),
            "usage_patterns": data_processor.identify_patterns(recent_data),
            "optimization_opportunities": system_optimizer.find_opportunities(recent_data),
            "risk_assessment": anomaly_detector.assess_risks(recent_data),
            "business_impact": predictor.calculate_business_impact(recent_data)
        }

        # Generate actionable recommendations
        recommendations = system_optimizer.generate_action_plan(insights)

        return {
            "insights": insights,
            "recommendations": recommendations,
            "confidence_score": np.mean([
                insights["performance_trends"]["confidence"],
                insights["usage_patterns"]["confidence"],
                insights["optimization_opportunities"]["confidence"]
            ]),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Insights generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")

@app.post("/api/ml/train")
async def retrain_models(background_tasks: BackgroundTasks):
    """Retrain ML models with latest data"""
    try:
        # Schedule model retraining in background
        background_tasks.add_task(retrain_all_models)

        return {
            "message": "Model retraining initiated",
            "estimated_completion": (datetime.now() + timedelta(minutes=30)).isoformat(),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Model retraining error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

async def retrain_all_models():
    """Background task to retrain all ML models"""
    try:
        logger.info("Starting model retraining...")

        # Get training data
        training_data = data_processor.get_training_data(days=30)

        # Retrain models
        await predictor.retrain(training_data)
        await anomaly_detector.retrain(training_data)
        await system_optimizer.retrain(training_data)

        logger.info("Model retraining completed successfully")

    except Exception as e:
        logger.error(f"Model retraining failed: {str(e)}")

@app.websocket("/ws/predictions")
async def websocket_predictions(websocket):
    """WebSocket endpoint for real-time predictions"""
    await websocket.accept()

    try:
        while True:
            # Generate real-time predictions
            current_predictions = await generate_realtime_predictions()

            # Send predictions via WebSocket
            await websocket.send_json(current_predictions)

            # Wait before next prediction
            await asyncio.sleep(5)

    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close()

async def generate_realtime_predictions():
    """Generate real-time predictions for WebSocket"""
    # Get current metrics
    current_data = data_processor.get_current_metrics()

    # Generate quick predictions
    predictions = {
        "next_5_minutes": predictor.quick_predict(current_data, "5m"),
        "next_hour": predictor.quick_predict(current_data, "1h"),
        "anomaly_score": anomaly_detector.current_anomaly_score(current_data),
        "optimization_score": system_optimizer.current_optimization_score(current_data),
        "timestamp": datetime.now().isoformat()
    }

    return predictions

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize ML models on startup"""
    logger.info("🧠 AI/ML Service starting up...")

    # Initialize models
    await predictor.initialize()
    await anomaly_detector.initialize()
    await system_optimizer.initialize()

    logger.info("🚀 AI/ML Service ready!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
