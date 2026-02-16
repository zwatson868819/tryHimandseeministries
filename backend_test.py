#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class MinistryAPITester:
    def __init__(self, base_url="https://himandsee-faith.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {test_name}: {details}")

    def test_health_check(self) -> bool:
        """Test API health check endpoint"""
        try:
            response = requests.get(f"{self.api_base}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_result("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_result("API Health Check", False, f"Error: {str(e)}")
            return False

    def test_contact_submission(self) -> Dict[str, Any]:
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "804-555-0100",
            "subject": "general",
            "message": "This is a test contact submission"
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/contact",
                json=contact_data,
                timeout=10
            )
            success = response.status_code == 201
            details = f"Status: {response.status_code}"
            contact_id = None
            
            if success:
                data = response.json()
                contact_id = data.get('id')
                details += f", Contact ID: {contact_id}"
            else:
                details += f", Error: {response.text}"
            
            self.log_result("Contact Form Submission", success, details)
            return {"success": success, "id": contact_id}
        except Exception as e:
            self.log_result("Contact Form Submission", False, f"Error: {str(e)}")
            return {"success": False, "id": None}

    def test_contact_validation(self) -> bool:
        """Test contact form validation (missing required fields)"""
        invalid_data = {
            "name": "",  # Missing required name
            "email": "invalid-email",  # Invalid email
            "subject": "",  # Missing subject
            "message": ""  # Missing message
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/contact",
                json=invalid_data,
                timeout=10
            )
            # Should return validation error (422 or 400)
            success = response.status_code in [400, 422]
            details = f"Status: {response.status_code} (Expected validation error)"
            
            self.log_result("Contact Form Validation", success, details)
            return success
        except Exception as e:
            self.log_result("Contact Form Validation", False, f"Error: {str(e)}")
            return False

    def test_volunteer_submission(self) -> Dict[str, Any]:
        """Test volunteer application submission"""
        volunteer_data = {
            "name": "Test Volunteer",
            "email": "volunteer@example.com",
            "phone": "804-555-0200",
            "opportunity": "Food Distribution",
            "message": "I would like to help with food distribution"
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/volunteers",
                json=volunteer_data,
                timeout=10
            )
            success = response.status_code == 201
            details = f"Status: {response.status_code}"
            volunteer_id = None
            
            if success:
                data = response.json()
                volunteer_id = data.get('id')
                details += f", Volunteer ID: {volunteer_id}"
            else:
                details += f", Error: {response.text}"
            
            self.log_result("Volunteer Application Submission", success, details)
            return {"success": success, "id": volunteer_id}
        except Exception as e:
            self.log_result("Volunteer Application Submission", False, f"Error: {str(e)}")
            return {"success": False, "id": None}

    def test_prayer_request_named(self) -> Dict[str, Any]:
        """Test prayer request submission with name/email"""
        prayer_data = {
            "name": "John Doe",
            "email": "john@example.com",
            "request": "Please pray for my family's health and safety",
            "isAnonymous": False
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/prayer-requests",
                json=prayer_data,
                timeout=10
            )
            success = response.status_code == 201
            details = f"Status: {response.status_code}"
            prayer_id = None
            
            if success:
                data = response.json()
                prayer_id = data.get('id')
                details += f", Prayer ID: {prayer_id}"
            else:
                details += f", Error: {response.text}"
            
            self.log_result("Prayer Request Submission (Named)", success, details)
            return {"success": success, "id": prayer_id}
        except Exception as e:
            self.log_result("Prayer Request Submission (Named)", False, f"Error: {str(e)}")
            return {"success": False, "id": None}

    def test_prayer_request_anonymous(self) -> Dict[str, Any]:
        """Test anonymous prayer request submission"""
        prayer_data = {
            "request": "Please pray for healing and strength during difficult times",
            "isAnonymous": True
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/prayer-requests",
                json=prayer_data,
                timeout=10
            )
            success = response.status_code == 201
            details = f"Status: {response.status_code}"
            prayer_id = None
            
            if success:
                data = response.json()
                prayer_id = data.get('id')
                details += f", Anonymous Prayer ID: {prayer_id}"
            else:
                details += f", Error: {response.text}"
            
            self.log_result("Prayer Request Submission (Anonymous)", success, details)
            return {"success": success, "id": prayer_id}
        except Exception as e:
            self.log_result("Prayer Request Submission (Anonymous)", False, f"Error: {str(e)}")
            return {"success": False, "id": None}

    def test_prayer_wall_display(self) -> bool:
        """Test prayer wall display (GET /api/prayer-requests)"""
        try:
            response = requests.get(
                f"{self.api_base}/prayer-requests?limit=10&public=true",
                timeout=10
            )
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                prayer_count = len(data) if isinstance(data, list) else 0
                details += f", Found {prayer_count} prayer requests"
                # Check if anonymized properly (no email fields in public view)
                if prayer_count > 0 and isinstance(data, list):
                    first_prayer = data[0]
                    if first_prayer.get('email') is None:
                        details += " (properly anonymized)"
                    else:
                        details += " (WARNING: emails exposed in public view)"
            else:
                details += f", Error: {response.text}"
            
            self.log_result("Prayer Wall Display", success, details)
            return success
        except Exception as e:
            self.log_result("Prayer Wall Display", False, f"Error: {str(e)}")
            return False

    def test_donation_submission(self) -> Dict[str, Any]:
        """Test donation form submission"""
        donation_data = {
            "amount": 50.00,
            "donation_type": "one-time",
            "name": "Test Donor",
            "email": "donor@example.com",
            "message": "Test donation for ministry support"
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/donations",
                json=donation_data,
                timeout=10
            )
            success = response.status_code == 201
            details = f"Status: {response.status_code}"
            donation_id = None
            
            if success:
                data = response.json()
                donation_id = data.get('id')
                details += f", Donation ID: {donation_id}, Status: {data.get('status', 'N/A')}"
            else:
                details += f", Error: {response.text}"
            
            self.log_result("Donation Submission", success, details)
            return {"success": success, "id": donation_id}
        except Exception as e:
            self.log_result("Donation Submission", False, f"Error: {str(e)}")
            return {"success": False, "id": None}

    def test_ministry_stats(self) -> bool:
        """Test ministry stats endpoint"""
        try:
            response = requests.get(f"{self.api_base}/stats", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                required_fields = ['total_contacts', 'total_volunteers', 'total_prayer_requests', 
                                 'total_donations', 'total_donation_amount']
                
                for field in required_fields:
                    if field not in data:
                        success = False
                        details += f", Missing field: {field}"
                        break
                
                if success:
                    stats_summary = ", ".join([f"{k}: {v}" for k, v in data.items()])
                    details += f", Stats: {stats_summary}"
            else:
                details += f", Error: {response.text}"
            
            self.log_result("Ministry Stats Endpoint", success, details)
            return success
        except Exception as e:
            self.log_result("Ministry Stats Endpoint", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend API tests"""
        print(f"\n🚀 Starting Backend API Tests for {self.base_url}\n")
        print("=" * 60)
        
        # Core API health check
        if not self.test_health_check():
            print("\n❌ API Health check failed - stopping tests")
            return self.get_results_summary()
        
        # Test all endpoints
        self.test_contact_submission()
        self.test_contact_validation()
        self.test_volunteer_submission()
        self.test_prayer_request_named()
        self.test_prayer_request_anonymous()
        self.test_prayer_wall_display()
        self.test_donation_submission()
        self.test_ministry_stats()
        
        return self.get_results_summary()

    def get_results_summary(self) -> Dict[str, Any]:
        """Get test results summary"""
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        
        print("\n" + "=" * 60)
        print(f"🏆 Backend API Test Results")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100:
            print("🎉 All tests passed!")
        elif success_rate >= 80:
            print("⚠️  Most tests passed - minor issues detected")
        else:
            print("❌ Significant issues detected - needs attention")
        
        return {
            "tests_run": self.tests_run,
            "tests_passed": self.tests_passed,
            "success_rate": success_rate,
            "test_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = MinistryAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    success_rate = results.get("success_rate", 0)
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())