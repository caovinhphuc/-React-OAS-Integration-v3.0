#!/usr/bin/env python3
"""
OneAutomationSystem - Main Automation Module
Hệ thống tự động hóa chính với các chức năng cơ bản
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent))

from modules.google_sheets import GoogleSheetsManager
from modules.email_sender import EmailSender
from modules.data_processor import DataProcessor
from modules.scheduler import TaskScheduler
from utils.logger import setup_logger
from config.settings import Settings

class OneAutomationSystem:
    """Main automation system class"""

    def __init__(self):
        self.settings = Settings()
        self.logger = setup_logger('OneAutomationSystem')
        self.google_sheets = GoogleSheetsManager()
        self.email_sender = EmailSender()
        self.data_processor = DataProcessor()
        self.scheduler = TaskScheduler()

    def initialize(self):
        """Initialize the automation system"""
        try:
            self.logger.info("Initializing OneAutomationSystem...")

            # Check configuration
            if not self._check_configuration():
                raise Exception("Configuration validation failed")

            # Initialize modules
            self.google_sheets.initialize()
            self.email_sender.initialize()
            self.data_processor.initialize()
            self.scheduler.initialize()

            self.logger.info("OneAutomationSystem initialized successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to initialize system: {str(e)}")
            return False

    def _check_configuration(self):
        """Check if all required configurations are present"""
        required_configs = [
            'GOOGLE_CREDENTIALS_PATH',
            'SMTP_HOST',
            'SMTP_USER',
            'SMTP_PASSWORD'
        ]

        missing_configs = []
        for config in required_configs:
            if not getattr(self.settings, config, None):
                missing_configs.append(config)

        if missing_configs:
            self.logger.error(f"Missing required configurations: {missing_configs}")
            return False

        return True

    def run_task(self, task_config):
        """Run a specific automation task"""
        try:
            task_type = task_config.get('type', 'unknown')
            task_name = task_config.get('name', 'Unnamed Task')

            self.logger.info(f"Starting task: {task_name} (Type: {task_type})")

            result = None
            if task_type == 'google_sheets_sync':
                result = self._run_google_sheets_sync(task_config)
            elif task_type == 'email_send':
                result = self._run_email_send(task_config)
            elif task_type == 'data_processing':
                result = self._run_data_processing(task_config)
            else:
                raise ValueError(f"Unknown task type: {task_type}")

            self.logger.info(f"Task completed successfully: {task_name}")
            return {
                'status': 'success',
                'result': result,
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            self.logger.error(f"Task failed: {task_name} - {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def _run_google_sheets_sync(self, config):
        """Run Google Sheets synchronization"""
        spreadsheet_id = config.get('spreadsheet_id')
        range_name = config.get('range', 'Sheet1!A1:Z1000')

        if not spreadsheet_id:
            raise ValueError("spreadsheet_id is required for Google Sheets sync")

        # Read data from Google Sheets
        data = self.google_sheets.read_sheet(spreadsheet_id, range_name)

        # Process data if needed
        processed_data = self.data_processor.process_sheet_data(data)

        return {
            'records_read': len(data),
            'records_processed': len(processed_data),
            'spreadsheet_id': spreadsheet_id
        }

    def _run_email_send(self, config):
        """Run email sending task"""
        recipients = config.get('recipients', [])
        subject = config.get('subject', 'Automation Report')
        template = config.get('template', 'default')
        data = config.get('data', {})

        if not recipients:
            raise ValueError("recipients list is required for email sending")

        # Send emails
        results = self.email_sender.send_bulk_email(
            recipients=recipients,
            subject=subject,
            template=template,
            data=data
        )

        return {
            'total_sent': len(results),
            'successful': sum(1 for r in results if r['status'] == 'sent'),
            'failed': sum(1 for r in results if r['status'] == 'failed')
        }

    def _run_data_processing(self, config):
        """Run data processing task"""
        source_type = config.get('source_type', 'csv')
        source_path = config.get('source_path')
        output_path = config.get('output_path')

        if not source_path:
            raise ValueError("source_path is required for data processing")

        # Process data
        result = self.data_processor.process_file(
            source_path=source_path,
            source_type=source_type,
            output_path=output_path
        )

        return result

    def start_scheduler(self):
        """Start the task scheduler"""
        try:
            self.logger.info("Starting task scheduler...")
            self.scheduler.start()

        except Exception as e:
            self.logger.error(f"Failed to start scheduler: {str(e)}")
            raise

    def stop_scheduler(self):
        """Stop the task scheduler"""
        try:
            self.logger.info("Stopping task scheduler...")
            self.scheduler.stop()

        except Exception as e:
            self.logger.error(f"Failed to stop scheduler: {str(e)}")
            raise

    def get_system_status(self):
        """Get current system status"""
        return {
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'modules': {
                'google_sheets': self.google_sheets.is_initialized(),
                'email_sender': self.email_sender.is_initialized(),
                'data_processor': self.data_processor.is_initialized(),
                'scheduler': self.scheduler.is_running()
            }
        }

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        # Run specific task
        try:
            task_config = json.loads(sys.argv[1])
            system = OneAutomationSystem()

            if system.initialize():
                result = system.run_task(task_config)
                print(json.dumps(result, indent=2))
                sys.exit(0 if result['status'] == 'success' else 1)
            else:
                print(json.dumps({'status': 'error', 'error': 'System initialization failed'}))
                sys.exit(1)

        except json.JSONDecodeError:
            print(json.dumps({'status': 'error', 'error': 'Invalid JSON configuration'}))
            sys.exit(1)
        except Exception as e:
            print(json.dumps({'status': 'error', 'error': str(e)}))
            sys.exit(1)
    else:
        # Start interactive mode or scheduler
        system = OneAutomationSystem()
        if system.initialize():
            print("OneAutomationSystem initialized successfully")
            print("Use system.start_scheduler() to start automatic task execution")
        else:
            print("Failed to initialize OneAutomationSystem")
            sys.exit(1)

if __name__ == "__main__":
    main()
