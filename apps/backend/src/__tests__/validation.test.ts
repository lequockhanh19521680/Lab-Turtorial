import { validateRequestBody } from '../utils/validation';
import { z } from 'zod';

describe('Zod Validation', () => {
  const TestSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    age: z.number().min(0).optional(),
  });

  describe('validateRequestBody', () => {
    test('should validate correct data successfully', () => {
      const validBody = JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      });

      const result = validateRequestBody(validBody, TestSchema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.age).toBe(30);
      }
    });

    test('should return error for invalid email', () => {
      const invalidBody = JSON.stringify({
        name: 'John Doe',
        email: 'invalid-email',
      });

      const result = validateRequestBody(invalidBody, TestSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.statusCode).toBe(400);
        const body = JSON.parse(result.response.body);
        expect(body.message).toBe('Validation failed');
        expect(body.error.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'Valid email is required'
            })
          ])
        );
      }
    });

    test('should return error for missing required field', () => {
      const invalidBody = JSON.stringify({
        email: 'john@example.com'
      });

      const result = validateRequestBody(invalidBody, TestSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.statusCode).toBe(400);
        const body = JSON.parse(result.response.body);
        expect(body.message).toBe('Validation failed');
        expect(body.error.errors).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
              message: expect.stringContaining('expected string')
            })
          ])
        );
      }
    });

    test('should return error for null body', () => {
      const result = validateRequestBody(null, TestSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.statusCode).toBe(400);
        const body = JSON.parse(result.response.body);
        expect(body.message).toBe('Request body is required');
      }
    });

    test('should return error for invalid JSON', () => {
      const invalidJson = '{ invalid json }';

      const result = validateRequestBody(invalidJson, TestSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.statusCode).toBe(400);
        const body = JSON.parse(result.response.body);
        expect(body.message).toBe('Invalid JSON format');
      }
    });
  });
});