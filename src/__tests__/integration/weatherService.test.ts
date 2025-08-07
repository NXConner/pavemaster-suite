import { describe, it, expect, beforeEach, vi } from 'vitest';
import { weatherService } from '../../services/external/weatherService';

// Mock fetch globally
global.fetch = vi.fn();

describe('WeatherService Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (fetch as any).mockClear();
  });

  describe('getCurrentConditions', () => {
    it('should fetch current weather conditions from API', async () => {
      const mockResponse = {
        weather: [{ main: 'Clear', description: 'clear sky' }],
        main: { temp: 72, humidity: 45, pressure: 1013 },
        wind: { speed: 5, deg: 180 },
        visibility: 10000,
        dt: Date.now() / 1000,
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

      expect(result).toBeDefined();
      expect(result.location).toEqual({ lat: 40.7128, lng: -74.0060 });
      expect(result.current.temperature).toBe(72);
      expect(result.workability.canWork).toBeDefined();
      expect(result.workability.score).toBeGreaterThanOrEqual(0);
      expect(result.workability.score).toBeLessThanOrEqual(100);
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

      // Should fallback to mock data
      expect(result).toBeDefined();
      expect(result.location).toEqual({ lat: 40.7128, lng: -74.0060 });
    });

    it('should calculate workability score correctly', async () => {
      const mockResponse = {
        weather: [{ main: 'Rain', description: 'heavy rain' }],
        main: { temp: 45, humidity: 85, pressure: 1005 },
        wind: { speed: 25, deg: 180 },
        visibility: 2000,
        dt: Date.now() / 1000,
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

      expect(result.workability.canWork).toBe(false);
      expect(result.workability.score).toBeLessThan(50);
      expect(result.workability.factors.precipitation.impact).toBe('high');
    });
  });

  describe('getWeatherForecast', () => {
    it('should fetch weather forecast for multiple days', async () => {
      const mockResponse = {
        daily: [
          {
            dt: Date.now() / 1000,
            temp: { min: 65, max: 75 },
            weather: [{ main: 'Clear', description: 'clear sky' }],
            humidity: 40,
            wind_speed: 5,
            pop: 0,
          },
        ],
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await weatherService.getWeatherForecast(40.7128, -74.0060, 5);

      expect(result).toBeDefined();
      expect(result.daily).toHaveLength(5);
      expect(result.workableDays).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should identify optimal working days', async () => {
      const mockResponse = {
        daily: Array.from({ length: 7 }, (_, i) => ({
          dt: (Date.now() / 1000) + (i * 86400),
          temp: { min: 65 + i, max: 75 + i },
          weather: [{ main: i < 3 ? 'Clear' : 'Rain', description: 'weather' }],
          humidity: 40 + (i * 5),
          wind_speed: 5 + i,
          pop: i < 3 ? 0 : 0.8,
        })),
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await weatherService.getWeatherForecast(40.7128, -74.0060, 7);

      expect(result.workableDays).toBeGreaterThan(0);
      expect(result.workableDays).toBeLessThanOrEqual(7);
      expect(result.recommendations).toContain('Optimal working conditions');
    });
  });

  describe('getWeatherAlerts', () => {
    it('should fetch weather alerts', async () => {
      const mockResponse = {
        alerts: [
          {
            event: 'Severe Thunderstorm Warning',
            description: 'Severe thunderstorms expected',
            start: Date.now() / 1000,
            end: (Date.now() / 1000) + 7200,
          },
        ],
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await weatherService.getWeatherAlerts(40.7128, -74.0060);

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('title');
        expect(result[0]).toHaveProperty('severity');
        expect(result[0]).toHaveProperty('description');
      }
    });
  });

  describe('Workability Analysis', () => {
    it('should calculate comprehensive workability scores', async () => {
      const testCases = [
        // Perfect conditions
        { temp: 70, humidity: 40, wind: 5, rain: false, expectedScore: 95 },
        // Hot conditions
        { temp: 95, humidity: 30, wind: 3, rain: false, expectedScore: 75 },
        // Cold conditions
        { temp: 35, humidity: 50, wind: 8, rain: false, expectedScore: 60 },
        // Rainy conditions
        { temp: 65, humidity: 80, wind: 15, rain: true, expectedScore: 30 },
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          weather: [{ main: testCase.rain ? 'Rain' : 'Clear', description: 'test' }],
          main: { temp: testCase.temp, humidity: testCase.humidity, pressure: 1013 },
          wind: { speed: testCase.wind, deg: 180 },
          visibility: 10000,
          dt: Date.now() / 1000,
        };

        (fetch as any).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

        expect(result.workability.score).toBeCloseTo(testCase.expectedScore, -1);
      }
    });
  });

  describe('Caching', () => {
    it('should cache API responses to reduce calls', async () => {
      const mockResponse = {
        weather: [{ main: 'Clear', description: 'clear sky' }],
        main: { temp: 72, humidity: 45, pressure: 1013 },
        wind: { speed: 5, deg: 180 },
        visibility: 10000,
        dt: Date.now() / 1000,
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call
      await weatherService.getCurrentConditions(40.7128, -74.0060);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await weatherService.getCurrentConditions(40.7128, -74.0060);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid coordinates', async () => {
      await expect(async () => {
        await weatherService.getCurrentConditions(91, 181); // Invalid lat/lng
      }).rejects.toThrow();
    });

    it('should handle API rate limiting', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ message: 'Rate limit exceeded' }),
      });

      const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

      // Should fallback to mock data
      expect(result).toBeDefined();
    });

    it('should handle network timeouts', async () => {
      (fetch as any).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => { reject(new Error('Timeout')); }, 1000),
        ),
      );

      const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

      // Should fallback to mock data
      expect(result).toBeDefined();
    });
  });

  describe('Material-Specific Recommendations', () => {
    it('should provide asphalt-specific recommendations', async () => {
      const mockResponse = {
        weather: [{ main: 'Clear', description: 'clear sky' }],
        main: { temp: 55, humidity: 45, pressure: 1013 }, // Borderline temperature
        wind: { speed: 5, deg: 180 },
        visibility: 10000,
        dt: Date.now() / 1000,
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

      expect(result.materialRecommendations.asphalt).toBeDefined();
      expect(result.materialRecommendations.sealcoating).toBeDefined();
      expect(result.materialRecommendations.striping).toBeDefined();
    });

    it('should warn about temperature extremes for different materials', async () => {
      const mockResponse = {
        weather: [{ main: 'Clear', description: 'clear sky' }],
        main: { temp: 30, humidity: 45, pressure: 1013 }, // Too cold for most work
        wind: { speed: 5, deg: 180 },
        visibility: 10000,
        dt: Date.now() / 1000,
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await weatherService.getCurrentConditions(40.7128, -74.0060);

      expect(result.materialRecommendations.asphalt.suitable).toBe(false);
      expect(result.materialRecommendations.sealcoating.suitable).toBe(false);
    });
  });
});