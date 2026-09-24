import React from 'react';
import { Input, InputProps } from './input';
import { cn } from '~/lib/utils';
import { useTranslationWithUtils } from '~/hooks/useTranslationWithUtils';
import { isExpression, safeEvaluateExpression } from '~/utils/expression';

const CurrencyInput: React.FC<
  Omit<InputProps, 'type' | 'inputMode'> & {
    currency: string;
    strValue: string;
    onValueChange: (v: { strValue?: string; bigIntValue?: bigint }) => void;
    allowNegative?: boolean;
    hideSymbol?: boolean;
  }
> = ({ className, currency, allowNegative, strValue, onValueChange, hideSymbol, ...props }) => {
  const { getCurrencyHelpersCached } = useTranslationWithUtils(undefined);
  const { format, parseToCleanString, toSafeBigInt, sanitizeInput, sanitizeExpressionInput } =
    getCurrencyHelpersCached(currency);

  return (
    <Input
      className={cn('text-lg placeholder:text-sm', className)}
      inputMode="decimal"
      value={strValue}
      onFocus={() => {
        if (!isExpression(strValue)) {
          onValueChange({ strValue: parseToCleanString(strValue, allowNegative) });
        }
      }}
      onBlur={() => {
        if (isExpression(strValue)) {
          return;
        }
        const formattedValue = format(strValue, { signed: allowNegative, hideSymbol });
        return onValueChange({ strValue: formattedValue });
      }}
      onChange={(e) => {
        const rawValue = e.target.value;
        if (isExpression(rawValue)) {
          const sanitized = sanitizeExpressionInput(rawValue, allowNegative, true);
          const evaluated = safeEvaluateExpression(sanitized);
          const bigIntValue =
            null !== evaluated ? toSafeBigInt(evaluated, allowNegative) : undefined;
          onValueChange({ strValue: sanitized, bigIntValue });
        } else {
          const strValue = sanitizeInput(rawValue, allowNegative, true);
          const bigIntValue = toSafeBigInt(strValue, allowNegative);
          onValueChange({ strValue, bigIntValue });
        }
      }}
      {...props}
    />
  );
};

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
