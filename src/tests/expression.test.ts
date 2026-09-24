import { isExpression, isValidExpressionResult, safeEvaluateExpression } from '../utils/expression';

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
    ['123', '123'],
    ['123.45', '123.45'],
    ['0.5', '0.5'],
    ['30.5+10.75', '41.25'],
    ['30.5+10.75-12-1.86', '27.39'],
    ['100-50', '50'],
    ['10*5', '50'],
    ['10/4', '2.5'],
    ['(30.5+10.75)*2', '82.5'],
    ['100/(2+3)', '20'],
    ['-10+5', '-5'],
    ['10-(-5)', '15'],
    ['1/-2', '-0.5'],
    ['-1/-2', '0.5'],
    ['--10', '10'],
    ['+10', '10'],
    ['0.1+0.2', '0.3'],
    ['.5+.5', '1'],
    ['1,5+2', '3.5'],
    ['100*0.01', '1'],
    ['9007199254740992+1', '9007199254740993'],
    ['999999999999999999999999+1', '1000000000000000000000000'],
  ])('should evaluate %p to %p', (input, expected) => {
    expect(safeEvaluateExpression(input)).toBe(expected);
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
    expect(safeEvaluateExpression(' 30.5 + 10.75 ')).toBe('41.25');
  });

  it('should handle operator precedence', () => {
    expect(safeEvaluateExpression('2+3*4')).toBe('14');
    expect(safeEvaluateExpression('2*3+4')).toBe('10');
    expect(safeEvaluateExpression('2+3*4-1')).toBe('13');
    expect(safeEvaluateExpression('20/5*2')).toBe('8');
  });

  it('should handle parentheses precedence', () => {
    expect(safeEvaluateExpression('2*(3+4)')).toBe('14');
    expect(safeEvaluateExpression('(2+3)*(4-1)')).toBe('15');
    expect(safeEvaluateExpression('2+3*(4-1)')).toBe('11');
  });
});

describe('isValidExpressionResult', () => {
  it.each([
    ['5', false, true],
    ['-5', false, false],
    ['-5', true, true],
    [null, false, false],
  ])('should return %p for result %p with allowNegative=%p', (result, allowNegative, expected) => {
    expect(isValidExpressionResult(result, allowNegative)).toBe(expected);
  });
});
