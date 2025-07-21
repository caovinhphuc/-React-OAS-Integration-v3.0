"""
Data Processor Module
"""

import json
import csv
import pandas as pd
import logging
from pathlib import Path

class DataProcessor:
    """Data processing manager"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._initialized = False

    def initialize(self):
        """Initialize data processor"""
        try:
            self._initialized = True
            self.logger.info("Data processor initialized")
        except Exception as e:
            self.logger.error(f"Failed to initialize data processor: {str(e)}")
            self._initialized = False

        return self._initialized

    def is_initialized(self):
        """Check if processor is initialized"""
        return self._initialized

    def process_sheet_data(self, data):
        """Process Google Sheets data"""
        try:
            if not data:
                return []

            # Convert to pandas DataFrame for easier processing
            if len(data) > 1:
                df = pd.DataFrame(data[1:], columns=data[0])

                # Basic data cleaning
                df = df.dropna(how='all')  # Remove empty rows
                df = df.fillna('')  # Fill NaN with empty string

                # Data validation
                processed_data = df.to_dict('records')
                self.logger.info(f"Processed {len(processed_data)} records")
                return processed_data
            else:
                return []

        except Exception as e:
            self.logger.error(f"Error processing sheet data: {str(e)}")
            return []

    def process_file(self, source_path, source_type='csv', output_path=None):
        """Process file data"""
        try:
            if not Path(source_path).exists():
                raise FileNotFoundError(f"Source file not found: {source_path}")

            if source_type.lower() == 'csv':
                data = self._process_csv(source_path)
            elif source_type.lower() in ['excel', 'xlsx']:
                data = self._process_excel(source_path)
            elif source_type.lower() == 'json':
                data = self._process_json(source_path)
            else:
                raise ValueError(f"Unsupported file type: {source_type}")

            # Save processed data if output path specified
            if output_path:
                self._save_processed_data(data, output_path)

            result = {
                'records_processed': len(data),
                'source_path': source_path,
                'output_path': output_path,
                'data': data[:10] if len(data) > 10 else data  # Sample data
            }

            self.logger.info(f"Processed {len(data)} records from {source_path}")
            return result

        except Exception as e:
            self.logger.error(f"Error processing file {source_path}: {str(e)}")
            return {'error': str(e), 'records_processed': 0}

    def _process_csv(self, file_path):
        """Process CSV file"""
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            return list(reader)

    def _process_excel(self, file_path):
        """Process Excel file"""
        df = pd.read_excel(file_path)
        return df.to_dict('records')

    def _process_json(self, file_path):
        """Process JSON file"""
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)

    def _save_processed_data(self, data, output_path):
        """Save processed data to file"""
        output_path = Path(output_path)

        if output_path.suffix.lower() == '.json':
            with open(output_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
        elif output_path.suffix.lower() == '.csv':
            if data:
                df = pd.DataFrame(data)
                df.to_csv(output_path, index=False, encoding='utf-8')
        else:
            # Default to JSON
            with open(output_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
