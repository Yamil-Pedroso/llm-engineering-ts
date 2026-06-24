import { useCallback, useEffect, useState } from "react";
import {
  askFlightAssistant,
  listTicketPrices,
  setTicketPrice,
  type FlightAssistantResponse,
  type TicketPrice,
} from "../../services/flightTicketsService";

export function useFlightTickets() {
  const [prices, setPrices] = useState<TicketPrice[]>([]);
  const [assistantResponse, setAssistantResponse] =
    useState<FlightAssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPrices = useCallback(async () => {
    const nextPrices = await listTicketPrices();
    setPrices(nextPrices);
  }, []);

  useEffect(() => {
    refreshPrices().catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load prices");
    });
  }, [refreshPrices]);

  const askPrice = useCallback(async (city: string) => {
    if (!city.trim()) {
      setError("Enter a destination city.");
      return;
    }

    setLoading(true);
    setError(null);
    setAssistantResponse(null);

    try {
      const result = await askFlightAssistant(city);
      setAssistantResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ask assistant");
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePrice = useCallback(
    async (city: string, price: number) => {
      if (!city.trim()) {
        setError("Enter a destination city.");
        return;
      }

      if (!Number.isFinite(price) || price < 0) {
        setError("Enter a valid price.");
        return;
      }

      setSaving(true);
      setError(null);

      try {
        const result = await setTicketPrice(city, price);
        setAssistantResponse(result);
        await refreshPrices();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save price");
      } finally {
        setSaving(false);
      }
    },
    [refreshPrices],
  );

  return {
    prices,
    assistantResponse,
    loading,
    saving,
    error,
    askPrice,
    updatePrice,
  };
}
