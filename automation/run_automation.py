#!/usr/bin/env python3
"""
Run Automation with Environment Variables
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Print loaded environment variables for debugging
print("🔧 Loaded Environment Variables:")
env_vars = ['GOOGLE_CREDENTIALS_PATH', 'SMTP_USER', 'SMTP_PASSWORD', 'DEBUG']
for var in env_vars:
    value = os.getenv(var, 'NOT SET')
    if 'PASSWORD' in var:
        value = '***hidden***' if value != 'NOT SET' else 'NOT SET'
    print(f"  {var}: {value}")

# Now run the main automation
print("\n🚀 Starting OneAutomationSystem...")

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / 'src'))

from main import OneAutomationSystem

system = OneAutomationSystem()
if system.initialize():
    print("✅ OneAutomationSystem initialized successfully!")
    print("📊 System Status:")
    status = system.get_system_status()
    print(f"  Status: {status['status']}")
    print(f"  Timestamp: {status['timestamp']}")
    print("  Modules:")
    for module, state in status['modules'].items():
        print(f"    {module}: {'✅' if state else '❌'}")
else:
    print("❌ Failed to initialize OneAutomationSystem")
    sys.exit(1)
