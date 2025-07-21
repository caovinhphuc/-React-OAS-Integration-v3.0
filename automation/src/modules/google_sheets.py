"""
Google Sheets Manager Module
"""

import os
import json
import logging
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

class GoogleSheetsManager:
    """Manager cho Google Sheets operations"""

    def __init__(self, credentials_path=None):
        self.credentials_path = credentials_path
        self.service = None
        self.logger = logging.getLogger(__name__)
        self._initialized = False

    def initialize(self):
        """Initialize Google Sheets service"""
        try:
            if self.credentials_path and os.path.exists(self.credentials_path):
                creds = Credentials.from_service_account_file(
                    self.credentials_path,
                    scopes=['https://www.googleapis.com/auth/spreadsheets']
                )
                self.service = build('sheets', 'v4', credentials=creds)
                self._initialized = True
                self.logger.info("Google Sheets service initialized")
            else:
                self.logger.warning("Google Sheets credentials not found - using mock mode")
                self._initialized = True

        except Exception as e:
            self.logger.error(f"Failed to initialize Google Sheets: {str(e)}")
            self._initialized = False

        return self._initialized

    def is_initialized(self):
        """Check if service is initialized"""
        return self._initialized

    def read_sheet(self, spreadsheet_id, range_name):
        """Read data from Google Sheets"""
        try:
            if not self._initialized:
                raise Exception("Google Sheets service not initialized")

            if self.service:
                result = self.service.spreadsheets().values().get(
                    spreadsheetId=spreadsheet_id,
                    range=range_name
                ).execute()

                values = result.get('values', [])
                self.logger.info(f"Read {len(values)} rows from sheet")
                return values
            else:
                # Mock data for demo
                mock_data = [
                    ['ID', 'Name', 'Status', 'Date'],
                    ['1', 'Task 1', 'Completed', '2024-12-07'],
                    ['2', 'Task 2', 'In Progress', '2024-12-07'],
                    ['3', 'Task 3', 'Pending', '2024-12-07']
                ]
                self.logger.info(f"Using mock data: {len(mock_data)} rows")
                return mock_data

        except Exception as e:
            self.logger.error(f"Error reading sheet: {str(e)}")
            return []

    def write_sheet(self, spreadsheet_id, range_name, values):
        """Write data to Google Sheets"""
        try:
            if not self._initialized:
                raise Exception("Google Sheets service not initialized")

            if self.service:
                body = {'values': values}
                result = self.service.spreadsheets().values().update(
                    spreadsheetId=spreadsheet_id,
                    range=range_name,
                    valueInputOption='RAW',
                    body=body
                ).execute()

                updated_cells = result.get('updatedCells', 0)
                self.logger.info(f"Updated {updated_cells} cells")
                return result
            else:
                self.logger.info(f"Mock write: {len(values)} rows to {range_name}")
                return {'updatedCells': len(values)}

        except Exception as e:
            self.logger.error(f"Error writing to sheet: {str(e)}")
            return None
