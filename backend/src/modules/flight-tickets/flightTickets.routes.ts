import { Router } from "express";
import {
  askFlightAssistantController,
  getTicketPriceController,
  listTicketPricesController,
  setTicketPriceController,
} from "./flightTickets.controller";

const router = Router();

router.get("/flight-tickets/prices", listTicketPricesController);
router.get("/flight-tickets/price", getTicketPriceController);
router.post("/flight-tickets/price", setTicketPriceController);
router.post("/flight-tickets/assistant", askFlightAssistantController);

export default router;
