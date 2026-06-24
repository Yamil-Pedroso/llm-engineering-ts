import { Request, Response } from "express";
import {
  askFlightAssistant,
  getTicketPrice,
  listTicketPrices,
  setTicketPrice,
} from "./flightTickets.service";

function getBodyCity(req: Request) {
  return typeof req.body.city === "string" ? req.body.city.trim() : "";
}

export async function listTicketPricesController(_req: Request, res: Response) {
  try {
    const prices = await listTicketPrices();
    return res.json({ prices });
  } catch (error) {
    console.error("Flight tickets list error:", error);
    return res.status(500).json({
      message: "Failed to list ticket prices",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getTicketPriceController(req: Request, res: Response) {
  try {
    const city =
      typeof req.query.city === "string" ? req.query.city.trim() : "";

    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    return res.json(await getTicketPrice(city));
  } catch (error) {
    console.error("Flight ticket price error:", error);
    return res.status(500).json({
      message: "Failed to get ticket price",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function setTicketPriceController(req: Request, res: Response) {
  try {
    const city = getBodyCity(req);
    const price = Number(req.body.price);

    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res
        .status(400)
        .json({ message: "price must be 0 or greater" });
    }

    return res.json(await setTicketPrice(city, price));
  } catch (error) {
    console.error("Flight ticket update error:", error);
    return res.status(500).json({
      message: "Failed to set ticket price",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function askFlightAssistantController(req: Request, res: Response) {
  try {
    const city = getBodyCity(req);

    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    return res.json(await askFlightAssistant(city));
  } catch (error) {
    console.error("Flight assistant error:", error);
    return res.status(500).json({
      message: "Failed to ask flight assistant",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
