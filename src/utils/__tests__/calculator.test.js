const { add, subtract, multiply, divide } = require('../calculator');

describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('should add zero', () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should subtract negative numbers', () => {
      expect(subtract(-2, -3)).toBe(1);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(4, 5)).toBe(20);
    });

    it('should multiply by zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Division by zero is not allowed');
    });
  });
});
