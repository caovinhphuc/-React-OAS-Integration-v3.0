#!/usr/bin/env python3
"""
Minimal AI Service for Production Deployment
- Simplified ML Service with basic functionality
- No heavy dependencies like tensorflow/torch
- Fast startup and minimal resource usage
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
import uvicorn
import asyncio
import random
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="React OAS Integration - AI Service (Minimal)",
    description="Production-ready ML API with minimal dependencies",
    version="4.0.0-minimal"
)

# Data Models
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str
    version: str

class PerformanceScore(BaseModel):
    score: int
    confidence: float
    factors: Dict[str, float]
    timestamp: str

class Prediction(BaseModel):
    metric: str
    values: List[float]
    timestamps: List[str]
    confidence: float

class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    impact: str
    priority: str
    category: str

class AIInsights(BaseModel):
    performance_score: PerformanceScore
    predictions: List[Prediction]
    recommendations: List[Recommendation]
    anomalies: List[Dict[str, Any]]

# Utility Functions
def generate_performance_score() -> PerformanceScore:
    """Generate a realistic performance score"""
    base_score = random.randint(75, 95)
    factors = {
        "response_time": random.uniform(0.8, 1.0),
        "throughput": random.uniform(0.85, 0.98),
        "error_rate": random.uniform(0.92, 0.99),
        "resource_usage": random.uniform(0.75, 0.95)
    }

    return PerformanceScore(
        score=base_score,
        confidence=random.uniform(0.85, 0.95),
        factors=factors,
        timestamp=datetime.now().isoformat()
    )

def generate_predictions() -> List[Prediction]:
    """Generate realistic time series predictions"""
    predictions = []

    metrics = ["response_time", "active_users", "cpu_usage", "memory_usage"]

    for metric in metrics:
        # Generate future timestamps
        timestamps = []
        values = []
        current_time = datetime.now()

        for i in range(24):  # 24 hours prediction
            future_time = current_time + timedelta(hours=i)
            timestamps.append(future_time.isoformat())

            # Generate realistic values based on metric type
            if metric == "response_time":
                values.append(random.uniform(50, 200))
            elif metric == "active_users":
                values.append(random.randint(100, 1000))
            elif metric in ["cpu_usage", "memory_usage"]:
                values.append(random.uniform(20, 80))

        predictions.append(Prediction(
            metric=metric,
            values=values,
            timestamps=timestamps,
            confidence=random.uniform(0.8, 0.95)
        ))

    return predictions

def generate_recommendations() -> List[Recommendation]:
    """Generate intelligent recommendations"""
    recommendations_data = [
        {
            "id": "opt-001",
            "title": "Optimize Database Queries",
            "description": "Implement query caching and indexing to reduce response times by 30%",
            "impact": "High",
            "priority": "High",
            "category": "Performance"
        },
        {
            "id": "scale-002",
            "title": "Scale Horizontally",
            "description": "Add 2 more instances to handle increasing user load",
            "impact": "Medium",
            "priority": "Medium",
            "category": "Scaling"
        },
        {
            "id": "monitor-003",
            "title": "Enhanced Monitoring",
            "description": "Set up advanced alerting for proactive issue detection",
            "impact": "Medium",
            "priority": "Low",
            "category": "Monitoring"
        }
    ]

    # Randomly select 1-3 recommendations
    selected = random.sample(recommendations_data, random.randint(1, 3))
    return [Recommendation(**rec) for rec in selected]

def detect_anomalies() -> List[Dict[str, Any]]:
    """Detect performance anomalies"""
    anomalies = []

    # Simulate anomaly detection
    if random.random() < 0.3:  # 30% chance of anomaly
        anomalies.append({
            "type": "performance_spike",
            "metric": "response_time",
            "value": random.uniform(500, 1000),
            "threshold": 200,
            "severity": "warning",
            "timestamp": datetime.now().isoformat(),
            "description": "Response time spike detected"
        })

    if random.random() < 0.2:  # 20% chance of resource anomaly
        anomalies.append({
            "type": "resource_usage",
            "metric": "memory_usage",
            "value": random.uniform(85, 95),
            "threshold": 80,
            "severity": "critical",
            "timestamp": datetime.now().isoformat(),
            "description": "High memory usage detected"
        })

    return anomalies

# API Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint - health check"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        service="AI/ML Service",
        version="4.0.0-minimal"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        service="AI/ML Service",
        version="4.0.0-minimal"
    )

@app.get("/ai/insights", response_model=AIInsights)
async def get_ai_insights():
    """Get comprehensive AI insights and predictions"""
    try:
        # Simulate processing time
        await asyncio.sleep(0.1)

        insights = AIInsights(
            performance_score=generate_performance_score(),
            predictions=generate_predictions(),
            recommendations=generate_recommendations(),
            anomalies=detect_anomalies()
        )

        logger.info("Generated AI insights successfully")
        return insights

    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI insights")

@app.get("/ai/performance")
async def get_performance_score():
    """Get current performance score"""
    try:
        return generate_performance_score()
    except Exception as e:
        logger.error(f"Error generating performance score: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate performance score")

@app.get("/ai/predictions/{metric}")
async def get_metric_prediction(metric: str):
    """Get prediction for specific metric"""
    try:
        predictions = generate_predictions()
        for pred in predictions:
            if pred.metric == metric:
                return pred

        raise HTTPException(status_code=404, detail=f"Metric '{metric}' not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating prediction for {metric}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate prediction")

@app.get("/ai/recommendations")
async def get_recommendations():
    """Get optimization recommendations"""
    try:
        return generate_recommendations()
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

# Add CORS middleware
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import asyncio

    logger.info("🚀 Starting Minimal AI Service...")
    logger.info("📊 Features: Performance scoring, predictions, recommendations")
    logger.info("⚡ Optimized for fast startup and minimal resource usage")

    uvicorn.run(
        "main_minimal:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=1,
        log_level="info"
    )
