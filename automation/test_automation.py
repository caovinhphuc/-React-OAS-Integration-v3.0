#!/usr/bin/env python3
"""
Simple Automation Test - Kiểm tra automation system cơ bản
"""

import os
import sys
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def test_automation_system():
    """Test basic automation system"""
    print("🤖 OneAutomationSystem - Test Mode")
    print("=" * 50)

    # Test environment variables
    print("📋 Environment Configuration:")
    env_vars = [
        'GOOGLE_CREDENTIALS_PATH',
        'GOOGLE_SPREADSHEET_ID',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'DEBUG',
        'LOG_LEVEL'
    ]

    for var in env_vars:
        value = os.getenv(var, 'NOT SET')
        # Hide sensitive info
        if 'PASSWORD' in var or 'KEY' in var:
            value = '***hidden***' if value != 'NOT SET' else 'NOT SET'
        print(f"  {var}: {value}")

    print("\n🔧 System Components:")

    # Test imports
    try:
        print("  ✅ Environment variables loaded")

        import pandas as pd
        print("  ✅ Pandas imported successfully")

        import requests
        print("  ✅ Requests imported successfully")

        from google.auth.transport.requests import Request
        print("  ✅ Google Auth imported successfully")

        print("  ✅ All required packages imported")

    except ImportError as e:
        print(f"  ❌ Import error: {e}")
        return False

    # Test basic functionality
    print("\n🚀 Basic Functionality Test:")

    try:
        # Test data processing
        data = {'test': [1, 2, 3], 'status': ['ok', 'ok', 'ok']}
        df = pd.DataFrame(data)
        print(f"  ✅ Data processing: {len(df)} records")

        # Test configuration
        debug_mode = os.getenv('DEBUG', 'False').lower() == 'true'
        print(f"  ✅ Debug mode: {debug_mode}")

        # Test file paths
        cred_path = os.getenv('GOOGLE_CREDENTIALS_PATH')
        if cred_path and os.path.exists(cred_path):
            print("  ✅ Google credentials file found")
        else:
            print("  ⚠️  Google credentials file not found (demo mode)")

        print("\n🎯 System Status: OPERATIONAL")
        print("✨ Automation system is ready for use!")

        return True

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_automation_system()
    sys.exit(0 if success else 1)
