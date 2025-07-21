"""
Simple AI/ML Service for React OAS Integration
Minimal FastAPI server with basic predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import random
import time
from datetime import datetime
import numpy as np

# Initialize FastAPI app
app = FastAPI(
    title="React OAS Integration AI Service - Simple",
    description="Lightweight ML-powered analytics and predictions",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API
class PredictionRequest(BaseModel):
    timeframe: str = "1h"  # 1h, 6h, 24h, 7d
    metrics: List[str] = ["response_time", "active_users", "cpu_usage"]


class PredictionResponse(BaseModel):
    predictions: Dict[str, List[float]]
    confidence_scores: Dict[str, float]
    insights: List[str]
    recommendations: List[str]


# Simple prediction functions
def generate_mock_predictions(metric: str, timeframe: str) -> Dict:
    """Generate mock predictions for demonstration"""
    base_values = {
        "response_time": 100,
        "active_users": 500,
        "cpu_usage": 50,
        "memory_usage": 60,
        "error_rate": 2.5
    }

    base_value = base_values.get(metric, 50)
    points = 10 if timeframe == "1h" else 20

    # Generate trend with some randomness
    trend = np.random.choice([-1, 0, 1], p=[0.3, 0.4, 0.3])
    values = []

    for i in range(points):
        variation = random.uniform(-0.2, 0.2)
        trend_effect = trend * i * 0.05
        value = base_value * (1 + variation + trend_effect)
        values.append(max(0, value))

    confidence = random.uniform(0.75, 0.95)

    return {
        "values": values,
        "confidence": confidence
    }


def generate_insights(predictions: Dict) -> List[str]:
    """Generate AI insights based on predictions"""
    insights = [
        "🔮 AI predictions generated successfully",
        "📈 System performance is within normal parameters",
        "🎯 No significant anomalies detected",
        "⚡ Response times are optimal"
    ]

    # Add specific insights based on data
    if "response_time" in predictions:
        avg_response = np.mean(predictions["response_time"])
        if avg_response > 150:
            insights.append("⚠️ Response times trending higher than baseline")
        else:
            insights.append("✅ Response times are performing well")

    if "active_users" in predictions:
        user_trend = np.polyfit(
            range(len(predictions["active_users"])),
            predictions["active_users"],
            1
        )[0]
        if user_trend > 0:
            insights.append("📈 User activity is increasing")
        else:
            insights.append("📉 User activity is stable or decreasing")

    return insights


def generate_recommendations() -> List[str]:
    """Generate AI recommendations"""
    recommendations = [
        "Continue monitoring system metrics for optimal performance",
        "Consider implementing caching for frequently accessed resources",
        "Review database query optimization opportunities",
        "Monitor user activity patterns for capacity planning"
    ]

    return random.sample(recommendations, 3)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "React OAS Integration AI Service - Simple",
        "version": "1.0.0",
        "status": "operational",
        "features": [
            "Mock Predictive Analytics",
            "System Insights",
            "Performance Recommendations"
        ],
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check with mock model status"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "predictor": True,
            "anomaly_detector": True,
            "optimizer": True
        },
        "uptime": "operational",
        "python_version": "3.11",
        "ai_status": "mock_mode"
    }


@app.post("/api/ml/predict")
async def predict_performance(request: PredictionRequest):
    """Generate mock performance predictions"""
    try:
        # Simulate processing time
        time.sleep(0.1)

        # Generate predictions for each metric
        predictions = {}
        confidence_scores = {}

        for metric in request.metrics:
            result = generate_mock_predictions(metric, request.timeframe)
            predictions[metric] = result["values"]
            confidence_scores[metric] = result["confidence"]

        # Generate insights and recommendations
        insights = generate_insights(predictions)
        recommendations = generate_recommendations()

        return PredictionResponse(
            predictions=predictions,
            confidence_scores=confidence_scores,
            insights=insights,
            recommendations=recommendations
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get("/api/ml/insights")
async def get_intelligent_insights():
    """Get mock AI-generated insights and trends"""
    try:
        # Mock insights data
        insights = {
            "performance_trends": {
                "performance_score": random.randint(75, 95),
                "trend_direction": random.choice([
                    "improving", "stable", "declining"
                ]),
                "confidence": random.uniform(0.8, 0.9)
            },
            "usage_patterns": {
                "peak_hours": ["10:00-12:00", "14:00-16:00"],
                "low_activity": ["02:00-06:00"],
                "confidence": random.uniform(0.85, 0.95)
            },
            "optimization_opportunities": {
                "database_queries": "15% improvement potential",
                "caching_efficiency": "23% improvement potential",
                "confidence": random.uniform(0.7, 0.9)
            },
            "business_impact": {
                "user_satisfaction": random.randint(85, 95),
                "estimated_revenue_impact": f"+{random.uniform(3, 8):.1f}%"
            }
        }

        # Mock recommendations
        recommendations = [
            {
                "action": "Implement database connection pooling",
                "priority": "high",
                "impact": "20% response time improvement"
            },
            {
                "action": "Add Redis caching layer",
                "priority": "medium",
                "impact": "30% faster data retrieval"
            },
            {
                "action": "Optimize frontend bundle size",
                "priority": "low",
                "impact": "10% faster page loads"
            }
        ]

        return {
            "insights": insights,
            "recommendations": recommendations,
            "confidence_score": random.uniform(0.8, 0.9),
            "timestamp": datetime.now().isoformat(),
            "data_source": "mock_ai_engine"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Insights generation failed: {str(e)}"
        )


@app.post("/api/ml/anomaly-detection")
async def detect_anomalies():
    """Mock anomaly detection"""
    return {
        "anomalies_detected": random.randint(0, 2),
        "anomalies": [],
        "alerts": [],
        "severity_levels": "low",
        "timestamp": datetime.now().isoformat(),
        "status": "normal_operation"
    }


@app.post("/api/ml/optimize")
async def optimize_system():
    """Mock system optimization recommendations"""
    return {
        "current_performance_score": random.randint(80, 95),
        "optimization_suggestions": [
            "Enable gzip compression",
            "Implement CDN for static assets",
            "Optimize database indexes"
        ],
        "predicted_improvements": {
            "response_time": "-25%",
            "throughput": "+40%",
            "resource_usage": "-15%"
        },
        "implementation_priority": ["high", "medium", "low"],
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
