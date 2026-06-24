import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const dbPath = path.join(__dirname, "prices.db");

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

const seedPrices: TicketPrice[] = [
  { city: "london", price: 799 },
  { city: "paris", price: 899 },
  { city: "tokyo", price: 1420 },
  { city: "sydney", price: 2999 },
];

function normalizeCity(city: string) {
  return city.trim().toLowerCase();
}

function displayCity(city: string) {
  const normalized = normalizeCity(city);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function runSql(sql: string) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  const { stdout } = await execFileAsync("sqlite3", [dbPath, sql]);
  return stdout.trim();
}

export async function initializeFlightTicketsDb() {
  await runSql("CREATE TABLE IF NOT EXISTS prices (city TEXT PRIMARY KEY, price REAL);");

  for (const ticketPrice of seedPrices) {
    await runSql(
      `INSERT OR IGNORE INTO prices (city, price) VALUES (${sqlString(ticketPrice.city)}, ${ticketPrice.price});`,
    );
  }
}

export async function listTicketPrices(): Promise<TicketPrice[]> {
  await initializeFlightTicketsDb();

  const output = await runSql(
    "SELECT city || '|' || price FROM prices ORDER BY city;",
  );

  if (!output) {
    return [];
  }

  return output.split("\n").map((row) => {
    const [city, price] = row.split("|");
    return {
      city,
      price: Number(price),
    };
  });
}

export async function getTicketPrice(city: string): Promise<FlightAssistantResponse> {
  await initializeFlightTicketsDb();

  const normalizedCity = normalizeCity(city);
  const output = await runSql(
    `SELECT price FROM prices WHERE city = ${sqlString(normalizedCity)};`,
  );
  const price = output ? Number(output) : null;
  const answer =
    price === null
      ? `No price data available for ${displayCity(city)}.`
      : `Ticket price to ${displayCity(city)} is $${price}.`;

  return {
    answer,
    toolCall: {
      toolName: "get_ticket_price",
      description: "Get the price of a return ticket to the destination city.",
      input: {
        destination_city: displayCity(city),
      },
      output: {
        city: normalizedCity,
        price,
        answer,
      },
    },
  };
}

export async function setTicketPrice(
  city: string,
  price: number,
): Promise<FlightAssistantResponse> {
  await mkdir(path.dirname(dbPath), { recursive: true });

  const normalizedCity = normalizeCity(city);
  await runSql(
    [
      "CREATE TABLE IF NOT EXISTS prices (city TEXT PRIMARY KEY, price REAL);",
      `INSERT INTO prices (city, price) VALUES (${sqlString(normalizedCity)}, ${price})`,
      `ON CONFLICT(city) DO UPDATE SET price = ${price};`,
    ].join(" "),
  );

  const answer = `Ticket price to ${displayCity(city)} has been set to $${price}.`;

  return {
    answer,
    toolCall: {
      toolName: "set_ticket_price",
      description: "Set or update the price of a return ticket.",
      input: {
        destination_city: displayCity(city),
        price,
      },
      output: {
        city: normalizedCity,
        price,
        answer,
      },
    },
  };
}

export async function askFlightAssistant(
  destinationCity: string,
): Promise<FlightAssistantResponse> {
  return getTicketPrice(destinationCity);
}
