import express from "express";

import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", getEvents);
router.get("/:id", getEvent);

// Organizer only
router.post("/", authenticate, authorize("ORGANIZER"), createEvent);

router.patch("/:id", authenticate, authorize("ORGANIZER"), updateEvent);

router.delete("/:id", authenticate, authorize("ORGANIZER"), deleteEvent);

export default router;
