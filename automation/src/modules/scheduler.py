"""
Task Scheduler Module
"""

import schedule
import time
import threading
import logging
from datetime import datetime

class TaskScheduler:
    """Task scheduling manager"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._initialized = False
        self._running = False
        self._scheduler_thread = None

    def initialize(self):
        """Initialize task scheduler"""
        try:
            self._initialized = True
            self.logger.info("Task scheduler initialized")
        except Exception as e:
            self.logger.error(f"Failed to initialize scheduler: {str(e)}")
            self._initialized = False

        return self._initialized

    def is_initialized(self):
        """Check if scheduler is initialized"""
        return self._initialized

    def is_running(self):
        """Check if scheduler is running"""
        return self._running

    def start(self):
        """Start the scheduler"""
        if not self._initialized:
            raise Exception("Scheduler not initialized")

        if self._running:
            self.logger.warning("Scheduler is already running")
            return

        self._running = True
        self._scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self._scheduler_thread.start()
        self.logger.info("Task scheduler started")

    def stop(self):
        """Stop the scheduler"""
        if self._running:
            self._running = False
            schedule.clear()
            self.logger.info("Task scheduler stopped")

    def schedule_task(self, task_func, interval='1h', **kwargs):
        """Schedule a task"""
        try:
            if interval.endswith('m'):
                minutes = int(interval[:-1])
                schedule.every(minutes).minutes.do(task_func, **kwargs)
            elif interval.endswith('h'):
                hours = int(interval[:-1])
                schedule.every(hours).hours.do(task_func, **kwargs)
            elif interval.endswith('d'):
                days = int(interval[:-1])
                schedule.every(days).days.do(task_func, **kwargs)
            else:
                # Default to every hour
                schedule.every().hour.do(task_func, **kwargs)

            self.logger.info(f"Task scheduled: {task_func.__name__} every {interval}")

        except Exception as e:
            self.logger.error(f"Error scheduling task: {str(e)}")

    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self._running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                self.logger.error(f"Scheduler error: {str(e)}")
                time.sleep(60)
