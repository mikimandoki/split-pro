export const isExpression = (input: string): boolean => {
  if (/[+*/()]/.test(input)) {
    return true;
  }
  if (input.length > 1 && input.slice(1).includes('-')) {
    return true;
  }
  return false;
};

export const safeEvaluateExpression = (input: string): number | null => {
  const normalized = input.replace(/\s/g, '').replaceAll(',', '.');
  if ('' === normalized) {
    return null;
  }

  let pos = 0;

  const peek = (): string => (pos < normalized.length ? normalized[pos]! : '');
  const consume = (): string => normalized[pos++]!;

  const parseExpression = (): number | null => {
    let left = parseTerm();
    if (null === left) {
      return null;
    }

    while ('+' === peek() || '-' === peek()) {
      const op = consume();
      const right = parseTerm();
      if (null === right) {
        return null;
      }
      left = '+' === op ? left + right : left - right;
    }
    return left;
  };

  const parseTerm = (): number | null => {
    let left = parseFactor();
    if (null === left) {
      return null;
    }

    while ('*' === peek() || '/' === peek()) {
      const op = consume();
      const right = parseFactor();
      if (null === right) {
        return null;
      }
      if ('/' === op && 0 === right) {
        return null;
      }
      left = '*' === op ? left * right : left / right;
    }
    return left;
  };

  const parseFactor = (): number | null => {
    if ('+' === peek()) {
      consume();
      return parseFactor();
    }
    if ('-' === peek()) {
      consume();
      const factor = parseFactor();
      if (null === factor) {
        return null;
      }
      return -factor;
    }
    return parsePrimary();
  };

  const parsePrimary = (): number | null => {
    if ('(' === peek()) {
      consume();
      const result = parseExpression();
      if (null === result || ')' !== peek()) {
        return null;
      }
      consume();
      return result;
    }
    return parseNumber();
  };

  const parseNumber = (): number | null => {
    let numStr = '';
    while (pos < normalized.length && /[0-9.]/.test(peek())) {
      numStr += consume();
    }
    if ('' === numStr || '.' === numStr) {
      return null;
    }
    if (numStr.split('.').length > 2) {
      return null;
    }
    const num = parseFloat(numStr);
    if (Number.isNaN(num)) {
      return null;
    }
    return num;
  };

  const result = parseExpression();
  if (null === result || pos !== normalized.length || !Number.isFinite(result)) {
    return null;
  }
  return Math.round(result * 1e10) / 1e10;
};
