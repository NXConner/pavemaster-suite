import asyncio
import aiohttp
import time
import random
import statistics
import json
from typing import List, Dict, Any
import matplotlib.pyplot as plt
import numpy as np

class PerformanceTestSuite:
    """
    Comprehensive performance testing framework
    """
    
    def __init__(
        self, 
        base_url: str, 
        endpoints: List[str],
        concurrency: int = 10,
        total_requests: int = 100
    ):
        """
        Initialize performance test suite
        
        :param base_url: Base URL for testing
        :param endpoints: List of endpoints to test
        :param concurrency: Number of concurrent requests
        :param total_requests: Total number of requests per endpoint
        """
        self.base_url = base_url
        self.endpoints = endpoints
        self.concurrency = concurrency
        self.total_requests = total_requests
        
        # Performance metrics storage
        self.performance_metrics = {
            endpoint: {
                'response_times': [],
                'status_codes': [],
                'errors': []
            } for endpoint in endpoints
        }
    
    async def _make_request(
        self, 
        session: aiohttp.ClientSession, 
        endpoint: str, 
        method: str = 'GET',
        payload: Dict[str, Any] = None
    ):
        """
        Make a single HTTP request
        
        :param session: Aiohttp client session
        :param endpoint: Endpoint to request
        :param method: HTTP method
        :param payload: Request payload
        :return: Request performance metrics
        """
        url = f"{self.base_url}{endpoint}"
        start_time = time.time()
        
        try:
            async with session.request(method, url, json=payload) as response:
                end_time = time.time()
                response_time = (end_time - start_time) * 1000  # Convert to milliseconds
                
                return {
                    'response_time': response_time,
                    'status_code': response.status,
                    'success': response.status < 400
                }
        except Exception as e:
            return {
                'response_time': None,
                'status_code': None,
                'success': False,
                'error': str(e)
            }
    
    async def _test_endpoint(
        self, 
        endpoint: str, 
        method: str = 'GET', 
        payload: Dict[str, Any] = None
    ):
        """
        Test a specific endpoint
        
        :param endpoint: Endpoint to test
        :param method: HTTP method
        :param payload: Request payload
        """
        async with aiohttp.ClientSession() as session:
            tasks = []
            for _ in range(self.total_requests):
                task = asyncio.create_task(
                    self._make_request(session, endpoint, method, payload)
                )
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            
            # Store metrics
            self.performance_metrics[endpoint]['response_times'] = [
                r['response_time'] for r in results if r['response_time'] is not None
            ]
            self.performance_metrics[endpoint]['status_codes'] = [
                r['status_code'] for r in results
            ]
            self.performance_metrics[endpoint]['errors'] = [
                r.get('error') for r in results if not r['success']
            ]
    
    async def run_tests(self):
        """
        Run performance tests for all endpoints
        """
        tasks = []
        for endpoint in self.endpoints:
            # Simulate different request types and payloads
            method = random.choice(['GET', 'POST'])
            payload = {
                'GET': None,
                'POST': {'test_data': random.randint(1, 1000)}
            }[method]
            
            task = asyncio.create_task(
                self._test_endpoint(endpoint, method, payload)
            )
            tasks.append(task)
        
        await asyncio.gather(*tasks)
    
    def generate_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive performance test report
        
        :return: Performance test report
        """
        report = {}
        
        for endpoint, metrics in self.performance_metrics.items():
            response_times = metrics['response_times']
            
            if not response_times:
                report[endpoint] = {
                    'status': 'FAILED',
                    'errors': metrics['errors']
                }
                continue
            
            report[endpoint] = {
                'status': 'PASSED',
                'total_requests': self.total_requests,
                'successful_requests': len([rt for rt in response_times if rt is not None]),
                'response_times': {
                    'min': min(response_times),
                    'max': max(response_times),
                    'mean': statistics.mean(response_times),
                    'median': statistics.median(response_times),
                    'std_dev': statistics.stdev(response_times) if len(response_times) > 1 else 0
                },
                'status_codes': dict(
                    zip(*np.unique(metrics['status_codes'], return_counts=True))
                ),
                'errors': metrics['errors']
            }
        
        return report
    
    def plot_performance_metrics(self):
        """
        Visualize performance metrics
        """
        plt.figure(figsize=(15, 5))
        
        # Response Time Boxplot
        plt.subplot(1, 2, 1)
        plt.title('Response Times by Endpoint')
        plt.boxplot([
            metrics['response_times'] 
            for metrics in self.performance_metrics.values()
        ])
        plt.xticks(
            range(1, len(self.endpoints) + 1), 
            self.endpoints, 
            rotation=45
        )
        plt.ylabel('Response Time (ms)')
        
        # Status Code Distribution
        plt.subplot(1, 2, 2)
        plt.title('Status Code Distribution')
        status_codes = [
            code for metrics in self.performance_metrics.values() 
            for code in metrics['status_codes']
        ]
        plt.hist(status_codes, bins=range(min(status_codes), max(status_codes) + 2))
        plt.xlabel('Status Code')
        plt.ylabel('Frequency')
        
        plt.tight_layout()
        plt.savefig('performance_metrics.png')
        plt.close()

def main():
    # Example usage
    test_suite = PerformanceTestSuite(
        base_url='https://api.example.com',
        endpoints=[
            '/users', 
            '/projects', 
            '/analytics'
        ],
        concurrency=20,
        total_requests=200
    )
    
    # Run tests
    asyncio.run(test_suite.run_tests())
    
    # Generate and print report
    report = test_suite.generate_report()
    print(json.dumps(report, indent=2))
    
    # Plot performance metrics
    test_suite.plot_performance_metrics()

if __name__ == "__main__":
    main()