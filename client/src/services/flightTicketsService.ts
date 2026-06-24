import apiClient from "../api/apiClient";

export type TicketPrice = {
  city: string;
  price: number;
};

export type FlightToolCall = {
  toolName: string;
  description: string;
  input: Record<string, string | number>;
  output: Record<string, string | number | null>;
};

export type FlightAssistantResponse = {
  answer: string;
  toolCall: FlightToolCall;
};

export async function listTicketPrices(): Promise<TicketPrice[]> {
  const response = await apiClient.get<{ prices: TicketPrice[] }>(
    "/flight-tickets/prices",
  );

  return response.data.prices;
}

export async function askFlightAssistant(
  city: string,
): Promise<FlightAssistantResponse> {
  const response = await apiClient.post<FlightAssistantResponse>(
    "/flight-tickets/assistant",
    { city },
  );

  return response.data;
}

export async function setTicketPrice(
  city: string,
  price: number,
): Promise<FlightAssistantResponse> {
  const response = await apiClient.post<FlightAssistantResponse>(
    "/flight-tickets/price",
    { city, price },
  );

  return response.data;
}
