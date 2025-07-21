"""
Settings Configuration
"""

import os
from pathlib import Path

class Settings:
    """Application settings"""

    def __init__(self):
        self.load_from_env()

    def load_from_env(self):
        """Load settings from environment variables"""

        # Google Sheets settings
        self.GOOGLE_CREDENTIALS_PATH = os.getenv('GOOGLE_CREDENTIALS_PATH')
        self.GOOGLE_SPREADSHEET_ID = os.getenv('GOOGLE_SPREADSHEET_ID')

        # Email settings
        self.SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
        self.SMTP_USER = os.getenv('SMTP_USER')
        self.SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')

        # OneAutomationSystem settings
        self.OAS_API_URL = os.getenv('OAS_API_URL')
        self.OAS_API_KEY = os.getenv('OAS_API_KEY')

        # General settings
        self.DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
        self.LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
