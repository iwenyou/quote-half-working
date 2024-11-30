import { PricingRule } from '../types/preset';
import { getPricingRules } from './presetService';
import { logDebug } from '../utils/logger';

function evaluateFormula(
  basePrice: number,
  width: number,
  height: number,
  depth: number,
  rules: PricingRule[]
): { [key: string]: number } {
  logDebug('evaluateFormula', 'Starting price calculation', {
    basePrice,
    width,
    height,
    depth
  });

  const values: { [key: string]: number } = {
    base_price: basePrice,
    width,
    height,
    depth,
    area: width * height,
    volume: width * height * depth,
    material_markup: 1.3,
    shipping_rate: 2.5,
    import_tax_rate: 0.05,
    storage_fee: 25,
    exchange_rate: 1
  };

  // Process rules in order
  rules.forEach((rule, index) => {
    logDebug('evaluateFormula', `Processing rule ${index + 1}`, { rule });
    
    let result = 0;
    
    rule.formula.forEach((step, stepIndex) => {
      const leftValue = stepIndex === 0 
        ? values[step.leftOperand] || 0
        : result;
      
      const rightValue = step.rightOperandType === 'factor'
        ? values[step.rightOperand] || 0
        : Number(step.rightOperand);

      logDebug('evaluateFormula', `Calculating step ${stepIndex + 1}`, {
        leftValue,
        operator: step.operator,
        rightValue
      });

      switch (step.operator) {
        case '+':
          result = leftValue + rightValue;
          break;
        case '-':
          result = leftValue - rightValue;
          break;
        case '*':
          result = leftValue * rightValue;
          break;
        case '/':
          result = rightValue !== 0 ? leftValue / rightValue : 0;
          break;
        case '%':
          result = leftValue * (rightValue / 100);
          break;
      }

      logDebug('evaluateFormula', `Step ${stepIndex + 1} result`, { result });
    });

    values[rule.result] = result;
    logDebug('evaluateFormula', `Rule ${index + 1} final result`, {
      resultKey: rule.result,
      value: result
    });
  });

  return values;
}

export function calculateDisplayedPrice(
  basePrice: number,
  width: number,
  height: number,
  depth: number
): number {
  logDebug('calculateDisplayedPrice', 'Starting price calculation', {
    basePrice,
    width,
    height,
    depth
  });

  const rules = getPricingRules();
  const values = evaluateFormula(basePrice, width, height, depth, rules);
  const finalPrice = values.displayed_price || values.final_price || basePrice;

  logDebug('calculateDisplayedPrice', 'Final price calculated', { finalPrice });
  return finalPrice;
}