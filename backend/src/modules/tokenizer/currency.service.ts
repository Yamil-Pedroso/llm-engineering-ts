import { CURRENCY_CONFIG } from "./config/currency";

export interface CurrencyConverter {
  convertUsdToChf(amountUsd: number): number;
  getUsdToChfRate(): number;
}

export class ConfigCurrencyConverter implements CurrencyConverter {
  convertUsdToChf(amountUsd: number): number {
    return amountUsd * CURRENCY_CONFIG.usdToChfRate;
  }

  getUsdToChfRate(): number {
    return CURRENCY_CONFIG.usdToChfRate;
  }
}

export const currencyConverter: CurrencyConverter =
  new ConfigCurrencyConverter();
