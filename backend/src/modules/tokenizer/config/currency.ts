export interface CurrencyConfig {
  baseCurrency: "USD";
  targetCurrency: "CHF";
  usdToChfRate: number;
  source: string;
  lastUpdated: string;
}

/**
 * Manual reference rate. A live exchange-rate adapter can replace this config
 * without changing tokenizer or pricing services.
 */
export const CURRENCY_CONFIG: CurrencyConfig = {
  baseCurrency: "USD",
  targetCurrency: "CHF",
  usdToChfRate: 0.8,
  source: "Manual configuration",
  lastUpdated: "2026-06-24",
};
