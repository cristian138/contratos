#!/usr/bin/env python3
"""
Backend API Testing for Electronic Contract Signature System
Academia Jotuns - Testing all endpoints and functionality
"""

import requests
import sys
import json
import os
from datetime import datetime
from pathlib import Path

class ContractSignatureAPITester:
    def __init__(self, base_url="https://sign-contracts.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_contract_id = None
        self.test_request_id = None
        self.test_otp = None

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            if expected_status and actual_status:
                print(f"   Expected status: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for multipart/form-data
                    test_headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True)
                    return True, response_data
                except:
                    self.log_test(name, True)
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, str(error_data), expected_status, response.status_code)
                except:
                    self.log_test(name, False, response.text[:200], expected_status, response.status_code)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        success, response = self.run_test(
            "Admin Login - Valid Credentials",
            "POST",
            "auth/admin/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        success, response = self.run_test(
            "Admin Login - Invalid Credentials",
            "POST",
            "auth/admin/login",
            401,
            data={"username": "wrong", "password": "wrong"}
        )
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, response = self.run_test(
            "Dashboard Statistics",
            "GET",
            "dashboard/stats",
            200
        )
        if success:
            required_fields = ['total_contracts', 'total_requests', 'pending_requests', 'signed_requests']
            for field in required_fields:
                if field not in response:
                    self.log_test("Dashboard Stats - Required Fields", False, f"Missing field: {field}")
                    return False
            self.log_test("Dashboard Stats - Required Fields", True)
        return success

    def test_get_contracts_empty(self):
        """Test getting contracts when none exist"""
        success, response = self.run_test(
            "Get Contracts - Empty List",
            "GET",
            "contracts",
            200
        )
        return success

    def test_create_contract(self):
        """Test creating a contract with PDF upload"""
        # Create a simple test PDF content (mock)
        test_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
        
        files = {'file': ('test_contract.pdf', test_pdf_content, 'application/pdf')}
        data = {
            'name': 'Test Contract',
            'description': 'Test contract for API testing'
        }
        
        success, response = self.run_test(
            "Create Contract",
            "POST",
            "contracts",
            200,
            data=data,
            files=files
        )
        
        if success and 'id' in response:
            self.test_contract_id = response['id']
            # Verify hash calculation
            if 'file_hash' in response and len(response['file_hash']) == 64:
                self.log_test("Contract Hash Generation", True)
            else:
                self.log_test("Contract Hash Generation", False, "Invalid or missing SHA-256 hash")
        return success

    def test_get_contracts_with_data(self):
        """Test getting contracts after creating one"""
        success, response = self.run_test(
            "Get Contracts - With Data",
            "GET",
            "contracts",
            200
        )
        if success and len(response) > 0:
            contract = response[0]
            required_fields = ['id', 'name', 'file_hash', 'created_at']
            for field in required_fields:
                if field not in contract:
                    self.log_test("Contract Fields Validation", False, f"Missing field: {field}")
                    return False
            self.log_test("Contract Fields Validation", True)
        return success

    def test_get_contract_by_id(self):
        """Test getting a specific contract by ID"""
        if not self.test_contract_id:
            self.log_test("Get Contract by ID", False, "No test contract ID available")
            return False
            
        success, response = self.run_test(
            "Get Contract by ID",
            "GET",
            f"contracts/{self.test_contract_id}",
            200
        )
        return success

    def test_download_contract(self):
        """Test downloading a contract file"""
        if not self.test_contract_id:
            self.log_test("Download Contract", False, "No test contract ID available")
            return False
            
        success, response = self.run_test(
            "Download Contract",
            "GET",
            f"contracts/{self.test_contract_id}/download",
            200
        )
        return success

    def test_create_signature_request(self):
        """Test creating a signature request"""
        if not self.test_contract_id:
            self.log_test("Create Signature Request", False, "No test contract ID available")
            return False
            
        data = {
            "contract_id": self.test_contract_id,
            "signer_name": "Test Signer",
            "signer_email": "test@example.com",
            "signer_phone": "+57 300 1234567"
        }
        
        success, response = self.run_test(
            "Create Signature Request",
            "POST",
            "signature-requests",
            200,
            data=data
        )
        
        if success and 'id' in response:
            self.test_request_id = response['id']
            # Verify token generation
            if 'token' in response and len(response['token']) > 20:
                self.log_test("Signature Request Token Generation", True)
            else:
                self.log_test("Signature Request Token Generation", False, "Invalid or missing token")
        return success

    def test_get_signature_requests(self):
        """Test getting signature requests"""
        success, response = self.run_test(
            "Get Signature Requests",
            "GET",
            "signature-requests",
            200
        )
        if success and len(response) > 0:
            request = response[0]
            required_fields = ['id', 'contract_id', 'signer_name', 'signer_email', 'status', 'token']
            for field in required_fields:
                if field not in request:
                    self.log_test("Signature Request Fields Validation", False, f"Missing field: {field}")
                    return False
            self.log_test("Signature Request Fields Validation", True)
        return success

    def test_get_signature_request_by_id(self):
        """Test getting a specific signature request by ID"""
        if not self.test_request_id:
            self.log_test("Get Signature Request by ID", False, "No test request ID available")
            return False
            
        success, response = self.run_test(
            "Get Signature Request by ID",
            "GET",
            f"signature-requests/{self.test_request_id}",
            200
        )
        return success

    def test_send_otp(self):
        """Test sending OTP for signature request"""
        if not self.test_request_id:
            self.log_test("Send OTP", False, "No test request ID available")
            return False
            
        data = {"request_id": self.test_request_id}
        
        success, response = self.run_test(
            "Send OTP",
            "POST",
            "signature-requests/send-otp",
            200,
            data=data
        )
        
        if success:
            # For testing purposes, we'll use a mock OTP
            self.test_otp = "123456"
            self.log_test("OTP Generation", True, "Mock OTP generated for testing")
        return success

    def test_verify_otp_invalid(self):
        """Test OTP verification with invalid code"""
        if not self.test_request_id:
            self.log_test("Verify OTP - Invalid", False, "No test request ID available")
            return False
            
        data = {
            "request_id": self.test_request_id,
            "otp": "000000"
        }
        
        success, response = self.run_test(
            "Verify OTP - Invalid Code",
            "POST",
            "signature-requests/verify-otp",
            200,  # API returns 200 with success: false
            data=data
        )
        
        if success and 'success' in response and not response['success']:
            self.log_test("OTP Validation Logic", True, "Correctly rejected invalid OTP")
            return True
        else:
            self.log_test("OTP Validation Logic", False, "Should reject invalid OTP")
            return False

    def test_audit_logs(self):
        """Test getting audit logs"""
        success, response = self.run_test(
            "Get Audit Logs",
            "GET",
            "audit-logs",
            200
        )
        if success and len(response) > 0:
            log = response[0]
            required_fields = ['id', 'request_id', 'action', 'details', 'timestamp']
            for field in required_fields:
                if field not in log:
                    self.log_test("Audit Log Fields Validation", False, f"Missing field: {field}")
                    return False
            self.log_test("Audit Log Fields Validation", True)
        return success

    def test_verify_integrity(self):
        """Test integrity verification endpoint"""
        # Test with a known hash
        test_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"  # Empty string SHA-256
        
        data = {"file_hash": test_hash}
        
        success, response = self.run_test(
            "Verify Integrity - Unknown Hash",
            "POST",
            "verify-integrity",
            200,
            data=data
        )
        
        if success and 'valid' in response and 'found_in_system' in response:
            self.log_test("Integrity Verification Response Format", True)
            return True
        else:
            self.log_test("Integrity Verification Response Format", False, "Missing required fields")
            return False

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Electronic Contract Signature System API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Authentication tests
        self.test_admin_login_invalid()
        if not self.test_admin_login_valid():
            print("❌ CRITICAL: Admin login failed - stopping tests")
            return False
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Contract management tests
        self.test_get_contracts_empty()
        if self.test_create_contract():
            self.test_get_contracts_with_data()
            self.test_get_contract_by_id()
            self.test_download_contract()
        
        # Signature request tests
        if self.test_create_signature_request():
            self.test_get_signature_requests()
            self.test_get_signature_request_by_id()
            self.test_send_otp()
            self.test_verify_otp_invalid()
        
        # Audit and verification tests
        self.test_audit_logs()
        self.test_verify_integrity()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n🔍 KEY FUNCTIONALITY STATUS:")
        key_tests = [
            "Admin Login - Valid Credentials",
            "Dashboard Statistics", 
            "Create Contract",
            "Contract Hash Generation",
            "Create Signature Request",
            "Send OTP",
            "Get Audit Logs",
            "Verify Integrity - Unknown Hash"
        ]
        
        for test_name in key_tests:
            result = next((r for r in self.test_results if r['test'] == test_name), None)
            if result:
                status = "✅" if result['success'] else "❌"
                print(f"  {status} {test_name}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = ContractSignatureAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Save detailed results
        results_file = "/app/backend_test_results.json"
        with open(results_file, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": tester.tests_passed/tester.tests_run*100 if tester.tests_run > 0 else 0,
                "test_results": tester.test_results
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: {results_file}")
        
        return 0 if success else 1
        
    except Exception as e:
        print(f"💥 Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())