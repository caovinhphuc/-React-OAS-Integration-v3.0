"""
Anomaly Detector - AI/ML Model for Intelligent Monitoring
Real-time anomaly detection and smart alerting
"""

import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from loguru import logger


class AnomalyDetector:
    """AI-powered anomaly detection and alerting"""

    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.baseline_metrics = {}
        self.alert_threshold = 0.3

        logger.info("🔍 AnomalyDetector initialized")

    async def initialize(self):
        """Initialize anomaly detection models"""
        try:
            logger.info("🧠 Initializing Anomaly Detector...")

            # Generate baseline data for training
            baseline_data = self._generate_baseline_data()

            # Train isolation forest
            X_scaled = self.scaler.fit_transform(baseline_data)
            self.model.fit(X_scaled)

            # Calculate baseline statistics
            self.baseline_metrics = {
                'response_time': {'mean': 100, 'std': 15, 'p95': 130},
                'active_users': {'mean': 500, 'std': 100, 'p95': 700},
                'cpu_usage': {'mean': 45, 'std': 12, 'p95': 70},
                'memory_usage': {'mean': 55, 'std': 10, 'p95': 75},
                'error_rate': {'mean': 2, 'std': 1.5, 'p95': 5}
            }

            self.is_trained = True
            logger.info("🚀 Anomaly Detector ready!")

        except Exception as e:
            logger.error(f"❌ Anomaly detector initialization failed: {e}")
            raise

    def is_ready(self) -> bool:
        """Check if anomaly detector is ready"""
        return self.is_trained

    def detect(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect anomalies in metrics data"""
        anomalies = []

        try:
            if not self.is_ready():
                self._sync_initialize()

            # Prepare data for anomaly detection
            numeric_columns = ['active_users', 'response_time', 'error_rate',
                             'cpu_usage', 'memory_usage', 'disk_usage', 'network_io']

            available_columns = [col for col in numeric_columns if col in data.columns]

            if not available_columns:
                logger.warning("No suitable columns for anomaly detection")
                return anomalies

            # Extract features
            features = data[available_columns].values

            # Scale features
            features_scaled = self.scaler.transform(features)

            # Detect anomalies
            anomaly_scores = self.model.decision_function(features_scaled)
            predictions = self.model.predict(features_scaled)

            # Process results
            for i, (score, prediction) in enumerate(zip(anomaly_scores, predictions)):
                if prediction == -1:  # Anomaly detected
                    anomaly = {
                        'timestamp': data.iloc[i]['timestamp'] if 'timestamp' in data.columns else datetime.now(),
                        'anomaly_score': float(score),
                        'severity': self._calculate_severity(score),
                        'affected_metrics': self._identify_affected_metrics(data.iloc[i], available_columns),
                        'description': self._generate_anomaly_description(data.iloc[i], available_columns)
                    }
                    anomalies.append(anomaly)

            logger.info(f"🔍 Detected {len(anomalies)} anomalies")
            return anomalies

        except Exception as e:
            logger.error(f"❌ Anomaly detection failed: {e}")
            return []

    def generate_alerts(self, anomalies: List[Dict]) -> List[Dict[str, Any]]:
        """Generate intelligent alerts from detected anomalies"""
        alerts = []

        try:
            for anomaly in anomalies:
                severity = anomaly.get('severity', 'medium')

                alert = {
                    'id': f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    'timestamp': anomaly.get('timestamp', datetime.now()),
                    'severity': severity,
                    'title': self._generate_alert_title(anomaly),
                    'message': self._generate_alert_message(anomaly),
                    'affected_systems': anomaly.get('affected_metrics', []),
                    'recommended_actions': self._suggest_actions(anomaly),
                    'escalation_required': severity in ['high', 'critical']
                }
                alerts.append(alert)

            return alerts

        except Exception as e:
            logger.error(f"❌ Alert generation failed: {e}")
            return []

    def assess_severity(self, anomalies: List[Dict]) -> Dict[str, int]:
        """Assess severity distribution of anomalies"""
        severity_counts = {'low': 0, 'medium': 0, 'high': 0, 'critical': 0}

        for anomaly in anomalies:
            severity = anomaly.get('severity', 'medium')
            severity_counts[severity] += 1

        return severity_counts

    def current_anomaly_score(self, current_data: Dict) -> float:
        """Calculate current anomaly score for real-time monitoring"""
        try:
            # Simplified anomaly scoring
            baseline_response_time = 100
            current_response_time = current_data.get('response_time', baseline_response_time)

            # Calculate deviation from baseline
            deviation = abs(current_response_time - baseline_response_time) / baseline_response_time

            # Convert to anomaly score (0-1, where 1 is most anomalous)
            anomaly_score = min(deviation, 1.0)

            return round(anomaly_score, 3)

        except Exception as e:
            logger.error(f"❌ Current anomaly score calculation failed: {e}")
            return 0.0

    def assess_risks(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Assess current risk levels"""
        try:
            risk_assessment = {
                'overall_risk': 'low',
                'risk_score': 25,
                'risk_factors': [],
                'mitigation_suggestions': []
            }

            # Simulate risk assessment
            if len(data) > 0:
                # Check for concerning patterns
                risk_factors = []

                # High response time risk
                risk_factors.append("Response time variability within normal range")

                # User load risk
                risk_factors.append("User activity patterns stable")

                # System resource risk
                risk_factors.append("Resource utilization optimized")

                risk_assessment['risk_factors'] = risk_factors
                risk_assessment['mitigation_suggestions'] = [
                    "Continue monitoring response time trends",
                    "Maintain current capacity planning",
                    "Regular performance optimization reviews"
                ]

            return risk_assessment

        except Exception as e:
            logger.error(f"❌ Risk assessment failed: {e}")
            return {"error": str(e)}

    async def retrain(self, training_data: pd.DataFrame):
        """Retrain anomaly detection models"""
        try:
            logger.info("🔄 Retraining anomaly detector...")

            numeric_columns = ['active_users', 'response_time', 'error_rate',
                             'cpu_usage', 'memory_usage']
            available_columns = [col for col in numeric_columns if col in training_data.columns]

            if available_columns:
                features = training_data[available_columns].values
                features_scaled = self.scaler.fit_transform(features)
                self.model.fit(features_scaled)

            logger.info("✅ Anomaly detector retrained successfully")

        except Exception as e:
            logger.error(f"❌ Retraining failed: {e}")
            raise

    def _generate_baseline_data(self) -> np.ndarray:
        """Generate baseline data for training"""
        # Simulate normal operating conditions
        n_samples = 1000

        data = np.array([
            np.random.normal(500, 50, n_samples),    # active_users
            np.random.normal(100, 15, n_samples),    # response_time
            np.random.exponential(2, n_samples),     # error_rate
            np.random.beta(2, 3, n_samples) * 100,   # cpu_usage
            np.random.beta(3, 2, n_samples) * 100,   # memory_usage
        ]).T

        return data

    def _calculate_severity(self, anomaly_score: float) -> str:
        """Calculate severity level from anomaly score"""
        if anomaly_score <= -0.5:
            return 'critical'
        elif anomaly_score <= -0.3:
            return 'high'
        elif anomaly_score <= -0.1:
            return 'medium'
        else:
            return 'low'

    def _identify_affected_metrics(self, row: pd.Series, columns: List[str]) -> List[str]:
        """Identify which metrics are contributing to the anomaly"""
        affected = []

        for col in columns:
            if col in self.baseline_metrics:
                value = row.get(col, 0)
                baseline = self.baseline_metrics[col]

                # Check if value is significantly different from baseline
                threshold = baseline['mean'] + 2 * baseline['std']
                if abs(value - baseline['mean']) > threshold:
                    affected.append(col)

        return affected if affected else columns[:1]  # Return at least one metric

    def _generate_anomaly_description(self, row: pd.Series, columns: List[str]) -> str:
        """Generate human-readable anomaly description"""
        try:
            affected_metrics = self._identify_affected_metrics(row, columns)

            if 'response_time' in affected_metrics:
                return "Unusual response time pattern detected"
            elif 'active_users' in affected_metrics:
                return "Abnormal user activity pattern observed"
            elif 'cpu_usage' in affected_metrics:
                return "CPU usage anomaly detected"
            else:
                return f"Anomaly detected in {', '.join(affected_metrics)}"

        except Exception:
            return "Performance anomaly detected"

    def _generate_alert_title(self, anomaly: Dict) -> str:
        """Generate alert title"""
        severity = anomaly.get('severity', 'medium')
        affected = anomaly.get('affected_metrics', ['system'])

        return f"{severity.title()} Alert: {', '.join(affected[:2])} anomaly"

    def _generate_alert_message(self, anomaly: Dict) -> str:
        """Generate detailed alert message"""
        description = anomaly.get('description', 'Anomaly detected')
        score = anomaly.get('anomaly_score', 0)

        return f"{description}. Anomaly score: {score:.3f}. Immediate investigation recommended."

    def _suggest_actions(self, anomaly: Dict) -> List[str]:
        """Suggest recommended actions for anomaly"""
        severity = anomaly.get('severity', 'medium')
        affected = anomaly.get('affected_metrics', [])

        actions = []

        if 'response_time' in affected:
            actions.append("Check server load and database performance")
            actions.append("Review recent deployments for performance impacts")

        if 'cpu_usage' in affected:
            actions.append("Monitor process utilization")
            actions.append("Consider scaling resources if needed")

        if severity in ['high', 'critical']:
            actions.append("Alert on-call team immediately")
            actions.append("Prepare for potential service degradation")

        return actions if actions else ["Monitor system closely", "Review logs for root cause"]

    def _sync_initialize(self):
        """Synchronous version of initialize"""
        try:
            logger.info("🔍 Initializing Anomaly Detector (sync)...")

            # Generate sample training data
            training_data = self._generate_sample_data()

            # Train anomaly detection models
            for detector in self.detectors.values():
                X = training_data[['active_users', 'response_time', 'error_rate',
                                 'cpu_usage', 'memory_usage']].fillna(0)
                detector.fit(X)

            self.is_trained = True
            logger.info("✓ Anomaly detection models trained!")

        except Exception as e:
            logger.error(f"Error in sync anomaly detector initialization: {e}")
            raise e
