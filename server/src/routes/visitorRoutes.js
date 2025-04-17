const express = require('express');
const router = express.Router();
const VisitorEntry = require('../models/VisitorEntry');
const Booking = require('../models/Booking');

// Verify a visitor ticket and record entry
router.post('/verify', async (req, res) => {
    try {
        const { ticketNumber, verifiedBy } = req.body;

        if (!ticketNumber || !verifiedBy) {
            return res.status(400).json({
                success: false,
                message: 'Ticket number and verifier information are required'
            });
        }

        // Find the booking by ticket number
        const booking = await Booking.findOne({ ticketNumber });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Invalid ticket number'
            });
        }

        // Check if payment is completed
        if (booking.paymentStatus !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Ticket payment is not completed'
            });
        }

        // Check if visit date is valid
        const visitDate = new Date(booking.visitDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (visitDate.toDateString() !== today.toDateString()) {
            return res.status(400).json({
                success: false,
                message: `Ticket is valid for ${visitDate.toDateString()}, not today`
            });
        }

        // Check if entry already recorded
        const existingEntry = await VisitorEntry.findOne({ ticketNumber, isExited: false });

        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: 'Visitor has already entered and not exited'
            });
        }

        // Record entry
        const visitorEntry = new VisitorEntry({
            bookingId: booking._id,
            ticketNumber,
            visitorName: booking.name,
            verifiedBy
        });

        await visitorEntry.save();

        res.status(201).json({
            success: true,
            message: 'Visitor entry recorded successfully',
            data: {
                entryId: visitorEntry._id,
                visitorName: booking.name,
                ticketType: booking.ticketType,
                numberOfVisitors: booking.numberOfVisitors,
                entryTime: visitorEntry.entryTime
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying visitor',
            error: error.message
        });
    }
});

// Record visitor exit
router.post('/exit/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;

        const visitorEntry = await VisitorEntry.findById(entryId);

        if (!visitorEntry) {
            return res.status(404).json({
                success: false,
                message: 'Entry record not found'
            });
        }

        if (visitorEntry.isExited) {
            return res.status(400).json({
                success: false,
                message: 'Visitor has already exited'
            });
        }

        visitorEntry.exitTime = new Date();
        visitorEntry.isExited = true;

        await visitorEntry.save();

        res.status(200).json({
            success: true,
            message: 'Visitor exit recorded successfully',
            data: visitorEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording visitor exit',
            error: error.message
        });
    }
});

// Get all visitors for today
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const visitors = await VisitorEntry.find({
            entryTime: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('bookingId', 'ticketType numberOfVisitors');

        res.status(200).json({
            success: true,
            count: visitors.length,
            data: visitors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s visitors',
            error: error.message
        });
    }
});

// Get visitor entry by ticket number
router.get('/ticket/:ticketNumber', async (req, res) => {
    try {
        const { ticketNumber } = req.params;

        const visitorEntry = await VisitorEntry.findOne({ ticketNumber })
            .populate('bookingId', 'name email mobileNumber ticketType numberOfVisitors visitDate');

        if (!visitorEntry) {
            return res.status(404).json({
                success: false,
                message: 'No entry record found for this ticket'
            });
        }

        res.status(200).json({
            success: true,
            data: visitorEntry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching visitor entry',
            error: error.message
        });
    }
});

module.exports = router; 