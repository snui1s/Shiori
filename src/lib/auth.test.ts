import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateRegistration } from './auth';

describe('Auth Utilities', () => {
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.th')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for passwords >= 8 chars', () => {
      expect(validatePassword('12345678').isValid).toBe(true);
    });

    it('should return false for passwords < 8 chars', () => {
      const result = validatePassword('1234567');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
    });
  });

  describe('validateRegistration', () => {
    it('should validate complete and correct data', () => {
      expect(validateRegistration('User', 'test@example.com', 'password123').isValid).toBe(true);
    });

    it('should fail if any field is missing', () => {
      expect(validateRegistration('', 'test@example.com', 'password123').isValid).toBe(false);
      expect(validateRegistration('User', '', 'password123').isValid).toBe(false);
      expect(validateRegistration('User', 'test@example.com', '').isValid).toBe(false);
    });
    
    it('should fail if email is invalid', () => {
      const result = validateRegistration('User', 'invalid-email', 'password123');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('รูปแบบอีเมลไม่ถูกต้อง');
    });
  });
});
