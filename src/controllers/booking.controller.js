import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { bookingQueue } from "../jobs/queue.js";

// Create Booking
export const createBooking = async (req, res) => {
  try {
    const { eventId, quantity } = req.body;

    // Basic validation
    if (!eventId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "eventId and quantity are required",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    // Atomic ticket reservation
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId,
        availableTickets: { $gte: quantity },
      },
      {
        $inc: {
          availableTickets: -quantity,
        },
      },
      {
        new: true,
      },
    );

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Event not found or not enough tickets available",
      });
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      event: event._id,
      quantity,
      totalAmount: event.ticketPrice * quantity,
      status: "CONFIRMED",
    });

    // Background confirmation job
    await bookingQueue.add("booking-confirmation", {
      bookingId: booking._id.toString(),
      customerId: req.user.id.toString(),
      eventId: event._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Current Customer's Bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
