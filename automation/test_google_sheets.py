#!/usr/bin/env python3
"""
Google Sheets Test Script for React OAS Integration
Test Google Sheets connectivity and operations
"""

import os
import sys
import json
from datetime import datetime

# Add the src directory to path so we can import modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from modules.google_sheets import GoogleSheetsManager
    from config.settings import get_setting
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the automation directory")
    sys.exit(1)

class GoogleSheetsTest:
    def __init__(self):
        self.manager = None
        self.test_results = {
            'initialization': False,
            'read_test': False,
            'write_test': False,
            'mock_mode': False
        }

    def test_initialization(self):
        """Test Google Sheets service initialization"""
        print("🧪 Testing Google Sheets initialization...")

        try:
            credentials_path = get_setting('GOOGLE_CREDENTIALS_PATH', './config/google-credentials.json')
            self.manager = GoogleSheetsManager(credentials_path)

            if self.manager.initialize():
                print("✅ Google Sheets manager initialized successfully")
                self.test_results['initialization'] = True

                # Check if using mock mode
                if not os.path.exists(credentials_path):
                    print("⚠️  Running in mock mode (no credentials found)")
                    self.test_results['mock_mode'] = True
                else:
                    print("✅ Using real Google Sheets credentials")

            else:
                print("❌ Failed to initialize Google Sheets manager")

        except Exception as e:
            print(f"❌ Initialization error: {e}")

        return self.test_results['initialization']

    def test_read_operation(self):
        """Test reading data from Google Sheets"""
        print("\n🧪 Testing Google Sheets read operation...")

        if not self.manager:
            print("❌ Manager not initialized")
            return False

        try:
            spreadsheet_id = get_setting('GOOGLE_SHEETS_ID', 'test_sheet_id')
            range_name = 'Sheet1!A1:D10'

            data = self.manager.read_sheet(spreadsheet_id, range_name)

            if data:
                print(f"✅ Read operation successful: {len(data)} rows returned")
                print("📊 Sample data:")
                for i, row in enumerate(data[:3]):  # Show first 3 rows
                    print(f"   Row {i+1}: {row}")
                self.test_results['read_test'] = True
            else:
                print("⚠️  Read operation returned empty data")

        except Exception as e:
            print(f"❌ Read operation error: {e}")

        return self.test_results['read_test']

    def test_write_operation(self):
        """Test writing data to Google Sheets"""
        print("\n🧪 Testing Google Sheets write operation...")

        if not self.manager:
            print("❌ Manager not initialized")
            return False

        try:
            spreadsheet_id = get_setting('GOOGLE_SHEETS_ID', 'test_sheet_id')
            range_name = 'Sheet1!A1:D1'

            # Test data
            test_data = [
                ['Test Date', 'Test API', 'Test Status', datetime.now().strftime('%Y-%m-%d %H:%M:%S')]
            ]

            result = self.manager.write_sheet(spreadsheet_id, range_name, test_data)

            if result:
                print("✅ Write operation successful")
                if 'updatedCells' in result:
                    print(f"📝 Updated {result['updatedCells']} cells")
                self.test_results['write_test'] = True
            else:
                print("❌ Write operation failed")

        except Exception as e:
            print(f"❌ Write operation error: {e}")

        return self.test_results['write_test']

    def test_authentication(self):
        """Test Google Sheets authentication"""
        print("\n🧪 Testing Google Sheets authentication...")

        credentials_path = get_setting('GOOGLE_CREDENTIALS_PATH', './config/google-credentials.json')

        if os.path.exists(credentials_path):
            try:
                with open(credentials_path, 'r') as f:
                    creds = json.load(f)

                required_fields = ['type', 'client_email', 'private_key', 'project_id']
                missing_fields = [field for field in required_fields if field not in creds]

                if missing_fields:
                    print(f"❌ Missing required fields in credentials: {missing_fields}")
                    return False
                else:
                    print("✅ Credentials file format is valid")
                    print(f"📧 Service account: {creds['client_email']}")
                    print(f"🆔 Project ID: {creds['project_id']}")
                    return True

            except json.JSONDecodeError:
                print("❌ Invalid JSON in credentials file")
                return False
            except Exception as e:
                print(f"❌ Error reading credentials: {e}")
                return False
        else:
            print(f"⚠️  Credentials file not found: {credentials_path}")
            print("📋 To set up credentials:")
            print("   1. Go to Google Cloud Console")
            print("   2. Create a service account")
            print("   3. Download JSON key file")
            print("   4. Place it at: " + credentials_path)
            return False

    def test_environment_variables(self):
        """Test environment variables configuration"""
        print("\n🧪 Testing environment variables...")

        required_vars = [
            'GOOGLE_CREDENTIALS_PATH',
            'GOOGLE_SHEETS_ID'
        ]

        missing_vars = []

        for var in required_vars:
            value = get_setting(var)
            if value and value != f'your_{var.lower()}_here':
                print(f"✅ {var}: {value}")
            else:
                print(f"⚠️  {var}: Not configured")
                missing_vars.append(var)

        if missing_vars:
            print(f"\n📋 Missing environment variables: {missing_vars}")
            print("💡 Update your .env file with actual values")
            return False
        else:
            print("✅ All required environment variables are configured")
            return True

    def run_all_tests(self):
        """Run all Google Sheets tests"""
        print("🚀 Starting Google Sheets Integration Tests")
        print("=" * 50)

        # Test environment variables
        env_ok = self.test_environment_variables()

        # Test authentication
        auth_ok = self.test_authentication()

        # Test initialization
        init_ok = self.test_initialization()

        if init_ok:
            # Test read operation
            read_ok = self.test_read_operation()

            # Test write operation
            write_ok = self.test_write_operation()
        else:
            read_ok = write_ok = False

        # Print summary
        print("\n" + "=" * 50)
        print("📊 Google Sheets Test Summary")
        print("=" * 50)
        print(f"Environment Variables: {'✅' if env_ok else '❌'}")
        print(f"Authentication: {'✅' if auth_ok else '❌'}")
        print(f"Initialization: {'✅' if init_ok else '❌'}")
        print(f"Read Operation: {'✅' if read_ok else '❌'}")
        print(f"Write Operation: {'✅' if write_ok else '❌'}")
        print(f"Mock Mode: {'✅' if self.test_results['mock_mode'] else '❌'}")

        total_tests = 5
        passed_tests = sum([env_ok, auth_ok, init_ok, read_ok, write_ok])
        success_rate = (passed_tests / total_tests) * 100

        print(f"\n🎯 Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests} tests passed)")

        if success_rate >= 80:
            print("🎉 Google Sheets integration is working well!")
        elif success_rate >= 60:
            print("⚠️  Google Sheets integration partially working")
        else:
            print("❌ Google Sheets integration needs attention")

        return success_rate

def main():
    """Main function"""
    tester = GoogleSheetsTest()
    success_rate = tester.run_all_tests()

    if success_rate < 100:
        print(f"\n📋 Next Steps:")
        print("1. Set up Google Cloud project and enable Sheets API")
        print("2. Create service account and download credentials")
        print("3. Place credentials in automation/config/google-credentials.json")
        print("4. Update GOOGLE_SHEETS_ID in .env file")
        print("5. Share your spreadsheet with service account email")
        print("\n📖 See GOOGLE_SHEETS_SETUP.md for detailed instructions")

if __name__ == "__main__":
    main()
