import requests
import json
import time
import random
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

class SheetsStressTester:
    def __init__(self, api_endpoint, num_entries=250, concurrent_requests=10):
        self.api_endpoint = api_endpoint
        self.num_entries = num_entries
        self.concurrent_requests = concurrent_requests
        self.success_count = 0
        self.error_count = 0
        self.responses = []
        self.lock = threading.Lock()
        
        # Sample data for generating realistic test entries
        self.ward_names = [
            "Kathmandu Ward 1", "Kathmandu Ward 2", "Kathmandu Ward 3", "Kathmandu Ward 4",
            "Lalitpur Ward 1", "Lalitpur Ward 2", "Bhaktapur Ward 1", "Bhaktapur Ward 2",
            "Kirtipur Ward 1", "Kirtipur Ward 2", "Madhyapur Ward 1", "Madhyapur Ward 2"
        ]
        
        self.ward_classes = ["A", "B", "C", "D"]
        
        self.participant_names = [
            "Ram Sharma", "Sita Poudel", "Krishna Adhikari", "Gita Maharjan",
            "Hari Shrestha", "Maya Tamang", "Suresh Gurung", "Kamala Rai",
            "Bikash Thapa", "Sunita Magar", "Dipak Singh", "Rashmi Khatri",
            "Anil Joshi", "Pramila Bhatta", "Rajesh Pandey", "Sangita Kafle"
        ]
        
        self.relations = [
            "Father", "Mother", "Guardian", "Uncle", "Aunt", "Grandfather", "Grandmother", "Brother", "Sister"
        ]
        
    def generate_test_data(self, entry_number):
        """Generate realistic test data for each entry"""
        # Generate timestamp slightly in the past to simulate real submissions
        base_time = datetime.now()
        random_minutes = random.randint(1, 1440)  # Random time within last 24 hours
        timestamp = (base_time - timedelta(minutes=random_minutes)).isoformat()
        
        num_participants = random.randint(1, 2)
        participants = []
        
        for i in range(num_participants):
            participants.append({
                "name": random.choice(self.participant_names),
                "relationToStudent": random.choice(self.relations)
            })
        
        return {
            "timestamp": timestamp,
            "wardName": random.choice(self.ward_names),
            "wardClass": random.choice(self.ward_classes),
            "numberOfParticipants": num_participants,
            "email": f"test{entry_number}@example.com",
            "phone": f"98{random.randint(10000000, 99999999)}",  # Nepal mobile format
            "participants": participants
        }
    
    def send_single_request(self, entry_number):
        """Send a single request to the API"""
        try:
            data = self.generate_test_data(entry_number)
            
            headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'StressTest/1.0'
            }
            
            response = requests.post(
                self.api_endpoint,
                json=data,
                headers=headers,
                timeout=30
            )
            
            result = {
                'entry_number': entry_number,
                'status_code': response.status_code,
                'response_data': response.json() if response.content else {},
                'success': response.status_code == 200,
                'timestamp': datetime.now().isoformat()
            }
            
            with self.lock:
                if result['success']:
                    self.success_count += 1
                else:
                    self.error_count += 1
                self.responses.append(result)
            
            return result
            
        except requests.exceptions.RequestException as e:
            result = {
                'entry_number': entry_number,
                'status_code': None,
                'response_data': {'error': str(e)},
                'success': False,
                'timestamp': datetime.now().isoformat()
            }
            
            with self.lock:
                self.error_count += 1
                self.responses.append(result)
            
            return result
    
    def run_stress_test(self):
        """Run the stress test with concurrent requests"""
        print(f"Starting stress test with {self.num_entries} entries...")
        print(f"Using {self.concurrent_requests} concurrent requests")
        print(f"Target endpoint: {self.api_endpoint}")
        print("-" * 60)
        
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=self.concurrent_requests) as executor:
            # Submit all requests
            future_to_entry = {
                executor.submit(self.send_single_request, i): i 
                for i in range(1, self.num_entries + 1)
            }
            
            # Process completed requests
            completed = 0
            for future in as_completed(future_to_entry):
                completed += 1
                entry_number = future_to_entry[future]
                
                try:
                    result = future.result()
                    if completed % 25 == 0:  # Progress update every 25 requests
                        print(f"Completed: {completed}/{self.num_entries} requests")
                        
                except Exception as exc:
                    print(f"Entry {entry_number} generated an exception: {exc}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        self.print_results(duration)
        self.save_results()
    
    def print_results(self, duration):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("STRESS TEST RESULTS")
        print("=" * 60)
        print(f"Total requests: {self.num_entries}")
        print(f"Successful requests: {self.success_count}")
        print(f"Failed requests: {self.error_count}")
        print(f"Success rate: {(self.success_count/self.num_entries)*100:.1f}%")
        print(f"Total duration: {duration:.2f} seconds")
        print(f"Average requests per second: {self.num_entries/duration:.2f}")
        
        # Analyze sheet distribution
        sheet_distribution = {}
        current_slot_count = 0
        
        for response in self.responses:
            if response['success'] and 'response_data' in response:
                data = response['response_data']
                sheet = data.get('sheet', 'unknown')
                current_slot = data.get('currentSlot', False)
                
                if sheet in sheet_distribution:
                    sheet_distribution[sheet] += 1
                else:
                    sheet_distribution[sheet] = 1
                
                if current_slot:
                    current_slot_count += 1
        
        print(f"\nSheet Distribution:")
        for sheet, count in sorted(sheet_distribution.items()):
            print(f"  Sheet {sheet}: {count} entries")
        
        print(f"Entries in current slot (Sheet1): {current_slot_count}")
        
        # Show any errors
        errors = [r for r in self.responses if not r['success']]
        if errors:
            print(f"\nFirst 5 errors:")
            for error in errors[:5]:
                print(f"  Entry {error['entry_number']}: {error['response_data']}")
    
    def save_results(self):
        """Save detailed results to a JSON file"""
        filename = f"stress_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        results_data = {
            'test_config': {
                'api_endpoint': self.api_endpoint,
                'num_entries': self.num_entries,
                'concurrent_requests': self.concurrent_requests
            },
            'summary': {
                'success_count': self.success_count,
                'error_count': self.error_count,
                'success_rate': (self.success_count/self.num_entries)*100
            },
            'detailed_responses': self.responses
        }
        
        with open(filename, 'w') as f:
            json.dump(results_data, f, indent=2, default=str)
        
        print(f"\nDetailed results saved to: {filename}")

def main():
    # Configuration
    API_ENDPOINT = "https://your-domain.com/api/rsvp"  # Replace with your actual endpoint
    NUM_ENTRIES = 250
    CONCURRENT_REQUESTS = 10  # Adjust based on your server capacity
    
    print("Google Sheets API Stress Tester")
    print("=" * 40)
    print("This script will send exactly 250 RSVP entries to test the sheet management logic.")
    print("Make sure to update the API_ENDPOINT variable with your actual endpoint URL.")
    print()
    
    # Get user confirmation
    endpoint = input(f"Enter API endpoint (default: {API_ENDPOINT}): ").strip()
    if endpoint:
        API_ENDPOINT = endpoint
    
    entries = input(f"Number of entries to send (default: {NUM_ENTRIES}): ").strip()
    if entries and entries.isdigit():
        NUM_ENTRIES = int(entries)
    
    concurrent = input(f"Concurrent requests (default: {CONCURRENT_REQUESTS}): ").strip()
    if concurrent and concurrent.isdigit():
        CONCURRENT_REQUESTS = int(concurrent)
    
    print(f"\nConfiguration:")
    print(f"  Endpoint: {API_ENDPOINT}")
    print(f"  Entries: {NUM_ENTRIES}")
    print(f"  Concurrent: {CONCURRENT_REQUESTS}")
    
    confirm = input("\nProceed with stress test? (y/N): ").strip().lower()
    if confirm != 'y':
        print("Test cancelled.")
        return
    
    # Run the stress test
    tester = SheetsStressTester(API_ENDPOINT, NUM_ENTRIES, CONCURRENT_REQUESTS)
    tester.run_stress_test()

if __name__ == "__main__":
    main()