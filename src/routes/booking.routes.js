import express from "express";

import {
  createBooking,
  getMyBookings,
} from "../controllers/booking.controller.js";

import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticate, authorize("CUSTOMER"), createBooking);

router.get("/my", authenticate, authorize("CUSTOMER"), getMyBookings);

export default router;
