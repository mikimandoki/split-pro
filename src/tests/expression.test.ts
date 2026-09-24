import { isExpression, safeEvaluateExpression } from '../utils/expression';

describe('isExpression', () => {
  it.each([
    ['123', false],
    ['123.45', false],
    ['-123.45', false],
    ['-', false],
    ['', false],
    ['123+456', true],
    ['123-456', true],
    ['123*456', true],
    ['123/456', true],
    ['(123)', true],
    ['30.5+10.75-12-1.86', true],
    ['(30.5+10.75)*2', true],
  ])('should return %p for input %p', (input, expected) => {
    expect(isExpression(input)).toBe(expected);
  });
});

describe('safeEvaluateExpression', () => {
  it.each([
    ['123', 123],
    ['123.45', 123.45],
    ['0.5', 0.5],
    ['30.5+10.75', 41.25],
    ['30.5+10.75-12-1.86', 27.39],
    ['100-50', 50],
    ['10*5', 50],
    ['10/4', 2.5],
    ['(30.5+10.75)*2', 82.5],
    ['100/(2+3)', 20],
    ['-10+5', -5],
    ['10-(-5)', 15],
    ['--10', 10],
    ['+10', 10],
    ['0.1+0.2', 0.3],
    ['.5+.5', 1],
    ['100*0.01', 1],
  ])('should evaluate %p to %p', (input, expected) => {
    expect(safeEvaluateExpression(input)).toBeCloseTo(expected, 10);
  });

  it.each([
    [''],
    ['abc'],
    ['30.5+'],
    ['+'],
    ['()'],
    ['(30.5+10'],
    ['30.5/0'],
    ['..5'],
    ['1.2.3'],
    ['30.5++'],
  ])('should return null for invalid expression %p', (input) => {
    expect(safeEvaluateExpression(input)).toBeNull();
  });

  it('should handle whitespace', () => {
    expect(safeEvaluateExpression(' 30.5 + 10.75 ')).toBeCloseTo(41.25, 10);
  });

  it('should handle operator precedence', () => {
    expect(safeEvaluateExpression('2+3*4')).toBeCloseTo(14, 10);
    expect(safeEvaluateExpression('2*3+4')).toBeCloseTo(10, 10);
    expect(safeEvaluateExpression('2+3*4-1')).toBeCloseTo(13, 10);
  });
});
