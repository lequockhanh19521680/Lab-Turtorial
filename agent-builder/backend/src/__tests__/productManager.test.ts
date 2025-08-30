import {
  extractFeatures,
  generateUserStories,
  validateRequirements,
  calculateComplexity,
  estimateDevelopmentTime
} from '../agents/productManager';

describe('Product Manager Agent Functions', () => {
  describe('extractFeatures', () => {
    it('should extract valid features from requirements', () => {
      const requirements = {
        features: ['User Authentication', 'Data Management', 'Real-time Updates']
      };
      
      const result = extractFeatures(requirements);
      
      expect(result).toEqual(['User Authentication', 'Data Management', 'Real-time Updates']);
    });

    it('should filter out empty or invalid features', () => {
      const requirements = {
        features: ['Valid Feature', '', '   ', 'Another Valid Feature', null, undefined]
      };
      
      const result = extractFeatures(requirements);
      
      expect(result).toEqual(['Valid Feature', 'Another Valid Feature']);
    });

    it('should return empty array when features is not an array', () => {
      const requirements = {
        features: 'not an array'
      };
      
      const result = extractFeatures(requirements);
      
      expect(result).toEqual([]);
    });

    it('should return empty array when features is missing', () => {
      const requirements = {};
      
      const result = extractFeatures(requirements);
      
      expect(result).toEqual([]);
    });
  });

  describe('generateUserStories', () => {
    it('should extract valid user stories from requirements', () => {
      const requirements = {
        userStories: [
          'As a user, I want to log in securely',
          'As a user, I want to manage my data'
        ]
      };
      
      const result = generateUserStories(requirements);
      
      expect(result).toEqual([
        'As a user, I want to log in securely',
        'As a user, I want to manage my data'
      ]);
    });

    it('should filter out empty or invalid user stories', () => {
      const requirements = {
        userStories: ['Valid story', '', '   ', 'Another valid story']
      };
      
      const result = generateUserStories(requirements);
      
      expect(result).toEqual(['Valid story', 'Another valid story']);
    });

    it('should return empty array when userStories is not an array', () => {
      const requirements = {
        userStories: 'not an array'
      };
      
      const result = generateUserStories(requirements);
      
      expect(result).toEqual([]);
    });
  });

  describe('validateRequirements', () => {
    it('should validate correct requirements structure', () => {
      const requirements = {
        features: ['Feature 1', 'Feature 2'],
        userStories: ['Story 1', 'Story 2'],
        technicalRequirements: ['Tech 1', 'Tech 2'],
        architecture: 'Modern serverless architecture'
      };
      
      const result = validateRequirements(requirements);
      
      expect(result).toBe(true);
    });

    it('should reject requirements with missing properties', () => {
      const requirements = {
        features: ['Feature 1'],
        userStories: ['Story 1']
        // Missing technicalRequirements and architecture
      };
      
      const result = validateRequirements(requirements);
      
      expect(result).toBe(false);
    });

    it('should reject requirements with wrong property types', () => {
      const requirements = {
        features: 'not an array',
        userStories: ['Story 1'],
        technicalRequirements: ['Tech 1'],
        architecture: 'Modern architecture'
      };
      
      const result = validateRequirements(requirements);
      
      expect(result).toBe(false);
    });

    it('should reject null or undefined requirements', () => {
      expect(validateRequirements(null)).toBe(false);
      expect(validateRequirements(undefined)).toBe(false);
    });
  });

  describe('calculateComplexity', () => {
    it('should return Low complexity for small projects', () => {
      const requirements = {
        features: ['Feature 1', 'Feature 2'],
        userStories: ['Story 1', 'Story 2']
      };
      
      const result = calculateComplexity(requirements);
      
      expect(result).toBe('Low');
    });

    it('should return Medium complexity for medium projects', () => {
      const requirements = {
        features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
        userStories: ['Story 1', 'Story 2', 'Story 3', 'Story 4', 'Story 5']
      };
      
      const result = calculateComplexity(requirements);
      
      expect(result).toBe('Medium');
    });

    it('should return High complexity for large projects', () => {
      const requirements = {
        features: Array.from({ length: 8 }, (_, i) => `Feature ${i + 1}`),
        userStories: Array.from({ length: 5 }, (_, i) => `Story ${i + 1}`)
      };
      
      const result = calculateComplexity(requirements);
      
      expect(result).toBe('High');
    });

    it('should handle empty or invalid requirements', () => {
      const requirements = {
        features: [],
        userStories: []
      };
      
      const result = calculateComplexity(requirements);
      
      expect(result).toBe('Low');
    });
  });

  describe('estimateDevelopmentTime', () => {
    it('should estimate 1-2 weeks for simple projects', () => {
      const requirements = {
        features: ['Feature 1'],
        userStories: ['Story 1']
      };
      
      const result = estimateDevelopmentTime(requirements);
      
      expect(result).toBe('1-2 weeks');
    });

    it('should estimate 2-4 weeks for medium projects', () => {
      const requirements = {
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        userStories: ['Story 1', 'Story 2']
      };
      
      const result = estimateDevelopmentTime(requirements);
      
      expect(result).toBe('2-4 weeks');
    });

    it('should estimate longer time for complex projects', () => {
      const requirements = {
        features: Array.from({ length: 10 }, (_, i) => `Feature ${i + 1}`),
        userStories: Array.from({ length: 5 }, (_, i) => `Story ${i + 1}`)
      };
      
      const result = estimateDevelopmentTime(requirements);
      
      expect(result).toBe('8+ weeks');
    });

    it('should handle projects with no features', () => {
      const requirements = {
        features: [],
        userStories: ['Story 1']
      };
      
      const result = estimateDevelopmentTime(requirements);
      
      expect(result).toBe('1-2 weeks');
    });
  });
});