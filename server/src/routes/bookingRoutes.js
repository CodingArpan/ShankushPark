const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Create a new booking
router.post('/', async (req, res) => {
    try {
        const {
            // User Information
            name,
            email,
            mobileNumber,
            governmentId,
            // Booking Information
            ticketType,
            visitDate,
            numberOfVisitors,
            ticketPrice,
            subtotal,
            taxes,
            totalAmount,
            promoCode,
            discount
        } = req.body;

        // Validate required fields
        if (!name || !email || !mobileNumber || !governmentId) {
            return res.status(400).json({
                success: false,
                message: 'User information is required'
            });
        }

        const booking = new Booking({
            name,
            email,
            mobileNumber,
            governmentId,
            ticketType,
            visitDate,
            numberOfVisitors,
            ticketPrice,
            subtotal,
            taxes,
            totalAmount,
            promoCode,
            discount
        });

        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
});

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
});

module.exports = router; 