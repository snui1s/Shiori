import { describe, it, expect } from 'vitest';
import { validateCommentContent } from './comments';

describe('Comment Utilities', () => {
  describe('validateCommentContent', () => {
    it('should return true for valid content', () => {
      expect(validateCommentContent('สวัสดีครับ').isValid).toBe(true);
      expect(validateCommentContent('บทความดีมากเลย!').isValid).toBe(true);
    });

    it('should fail for empty or whitespace content', () => {
      expect(validateCommentContent('').isValid).toBe(false);
      expect(validateCommentContent('   ').isValid).toBe(false);
    });

    it('should fail for very short content', () => {
      const result = validateCommentContent('ก');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('คอมเมนต์สั้นไปนิด ลองพิมพ์เพิ่มอีกหน่อยเนอะ');
    });

    it('should fail for very long content', () => {
      const longText = 'a'.repeat(1001);
      const result = validateCommentContent(longText);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('คอมเมนต์ยาวเกินไปหน่อยนะ (จำกัด 1,000 ตัวอักษร)');
    });
  });
});
