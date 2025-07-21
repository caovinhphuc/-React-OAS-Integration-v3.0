#!/usr/bin/env python3
"""
Test Automation Scheduler
Kiểm tra và khởi động task scheduler
"""

import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))

from main import OneAutomationSystem

def test_scheduler():
    """Test automation scheduler functionality"""
    print("🔄 Testing Automation Scheduler")
    print("=" * 50)

    # Initialize system
    system = OneAutomationSystem()
    if not system.initialize():
        print("❌ Failed to initialize automation system")
        return False

    print("✅ Automation system initialized")

    # Check current status
    status = system.get_system_status()
    print(f"\n📊 Current Status:")
    print(f"  System: {status['status']}")
    print(f"  Timestamp: {status['timestamp']}")

    print(f"\n🔧 Module Status:")
    for module, state in status['modules'].items():
        icon = "✅" if state else "❌"
        print(f"  {icon} {module}")

    # Test scheduler operations
    print(f"\n🚀 Testing Scheduler:")

    try:
        # Check if scheduler is running
        if not system.scheduler.is_running():
            print("  📋 Scheduler is not running - starting...")
            system.start_scheduler()
            print("  ✅ Scheduler started successfully")
        else:
            print("  ✅ Scheduler is already running")

        # Test a simple task
        print("  🧪 Testing simple task execution...")

        test_task = {
            "type": "data_processing",
            "name": "Test Data Processing",
            "source_type": "demo",
            "source_path": "demo_data.csv",
            "output_path": "demo_output.csv"
        }

        result = system.run_task(test_task)
        print(f"  📝 Task result: {result['status']}")

        if result['status'] == 'success':
            print("  ✅ Task executed successfully")
        else:
            print(f"  ⚠️  Task failed: {result.get('error', 'Unknown error')}")

        # Get final status
        final_status = system.get_system_status()
        print(f"\n🎯 Final Status:")
        print(f"  System: {final_status['status']}")

        all_modules_ready = all(final_status['modules'].values())
        if all_modules_ready:
            print("  🚀 All modules operational!")
            return True
        else:
            failed_modules = [k for k, v in final_status['modules'].items() if not v]
            print(f"  ⚠️  Some modules not ready: {failed_modules}")
            return False

    except Exception as e:
        print(f"  ❌ Error testing scheduler: {e}")
        return False

def demo_task_examples():
    """Show example tasks that can be run"""
    print(f"\n📋 Example Tasks You Can Run:")
    print("-" * 30)

    examples = [
        {
            "name": "Google Sheets Sync",
            "config": {
                "type": "google_sheets_sync",
                "name": "Daily Data Sync",
                "spreadsheet_id": "your-spreadsheet-id",
                "range": "Sheet1!A1:Z100"
            }
        },
        {
            "name": "Email Report",
            "config": {
                "type": "email_send",
                "name": "Weekly Report",
                "recipients": ["user@example.com"],
                "subject": "Weekly Automation Report",
                "template": "weekly_report"
            }
        },
        {
            "name": "Data Processing",
            "config": {
                "type": "data_processing",
                "name": "Process Sales Data",
                "source_type": "csv",
                "source_path": "sales_data.csv",
                "output_path": "processed_sales.csv"
            }
        }
    ]

    for i, example in enumerate(examples, 1):
        print(f"\n{i}. {example['name']}:")
        print(f"   Command: python src/main.py '{example['config']}'")

if __name__ == "__main__":
    print("🤖 OneAutomationSystem Scheduler Test")
    print("=" * 50)

    success = test_scheduler()

    if success:
        demo_task_examples()
        print(f"\n✨ Scheduler test completed successfully!")
        print(f"🔄 Automation system is fully operational!")
    else:
        print(f"\n❌ Scheduler test failed")
        sys.exit(1)
