// K6 Load Testing Script for PaveMaster Suite
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Steady state
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Steady state
    { duration: '2m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
};

export function setup() {
  console.log('Starting load test for PaveMaster Suite');
  console.log(`Base URL: ${BASE_URL}`);
}

export default function () {
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // Test 1: Homepage load
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage loads': (r) => r.status === 200,
    'homepage load time OK': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Auth page load
  response = http.get(`${BASE_URL}/auth`);
  check(response, {
    'auth page loads': (r) => r.status === 200,
    'auth page load time OK': (r) => r.timings.duration < 800,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Projects page (would require auth in real scenario)
  response = http.get(`${BASE_URL}/projects`);
  check(response, {
    'projects page accessible': (r) => r.status === 200 || r.status === 302,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Equipment page
  response = http.get(`${BASE_URL}/equipment`);
  check(response, {
    'equipment page accessible': (r) => r.status === 200 || r.status === 302,
  }) || errorRate.add(1);

  sleep(1);

  // Test 5: Fleet page
  response = http.get(`${BASE_URL}/fleet`);
  check(response, {
    'fleet page accessible': (r) => r.status === 200 || r.status === 302,
  }) || errorRate.add(1);

  sleep(1);

  // Test 6: Employees page
  response = http.get(`${BASE_URL}/employees`);
  check(response, {
    'employees page accessible': (r) => r.status === 200 || r.status === 302,
  }) || errorRate.add(1);

  sleep(2);
}

export function teardown(data) {
  console.log('Load test completed');
}