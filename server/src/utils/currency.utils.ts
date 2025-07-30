export function convert(
  amount: number,
  fromCurrencyExchangeRate: number | undefined,
  toCurrencyExchangeRate: number | undefined
): number {
  if (amount === 0) return 0;
  if (fromCurrencyExchangeRate === undefined || toCurrencyExchangeRate === undefined) {
    throw new Error('Exchange rates must be defined for conversion.');
  }
  if (fromCurrencyExchangeRate === toCurrencyExchangeRate) {
    return amount;
  }
  return amount * getRate(toCurrencyExchangeRate, fromCurrencyExchangeRate);
}

function getRate(toRate: number, fromRate: number): number {
  return toRate * (1 / fromRate);
}

