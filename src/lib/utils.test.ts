import { describe, expect, it } from "vitest";
import { calculateReadingTime } from "./utils";

describe("Utility Functions", () => {
  describe("calculateReadingTime", () => {
    it("should return 1 minute for short text", () => {
      const text = "Hello world";
      expect(calculateReadingTime(text)).toBe(1);
    });

    it("should calculate correctly for longer text", () => {
      // Generate ~400 words
      const text = "word ".repeat(400);
      expect(calculateReadingTime(text)).toBe(2);
    });

    it("should ignore HTML tags", () => {
      const html = "<div>" + "word ".repeat(200) + "</div>";
      expect(calculateReadingTime(html)).toBe(1);
    });

    it("should handle empty strings", () => {
      expect(calculateReadingTime("")).toBe(1); // Minimum 1 min
    });
  });
});
