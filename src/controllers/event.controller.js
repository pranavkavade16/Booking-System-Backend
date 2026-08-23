import Event from "../models/Event.js";
import { eventNotificationQueue } from "../jobs/queue.js";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const { title, description, location, date, ticketPrice, totalTickets } =
      req.body;

    if (
      !title ||
      !description ||
      !location ||
      !date ||
      ticketPrice === undefined ||
      !totalTickets
    ) {
      return res.status(400).json({
        success: false,
        message: "All event fields are required",
      });
    }

    if (totalTickets < 1) {
      return res.status(400).json({
        success: false,
        message: "Total tickets must be at least 1",
      });
    }

    if (ticketPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Ticket price cannot be negative",
      });
    }

    const event = await Event.create({
      title,
      description,
      location,
      date,
      ticketPrice,
      totalTickets,
      availableTickets: totalTickets,
      organizer: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      date: { $gte: new Date() },
    })
      .populate("organizer", "name email")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email",
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the owner",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "location",
      "date",
      "ticketPrice",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // If total ticket capacity changes,
    // make sure it doesn't become lower than already booked tickets.
    if (req.body.totalTickets !== undefined) {
      const bookedTickets = event.totalTickets - event.availableTickets;

      if (req.body.totalTickets < bookedTickets) {
        return res.status(400).json({
          success: false,
          message: "Total tickets cannot be lower than already booked tickets",
        });
      }

      event.availableTickets = req.body.totalTickets - bookedTickets;
    }

    await event.save();

    await eventNotificationQueue.add("event-updated", {
      eventId: event._id.toString(),
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      organizer: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the owner",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
