const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_tpregUYEDsOuNL",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "h4HwTcjFF9IWU6c5QdBV0ToS"
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', bookingId } = req.body;

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
            receipt: `receipt_${bookingId}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        // Update booking with Razorpay order ID
        await Booking.findByIdAndUpdate(bookingId, {
            razorpayOrderId: order.id
        });

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "h4HwTcjFF9IWU6c5QdBV0ToS")
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update booking status
            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    paymentStatus: 'completed',
                    razorpayPaymentId: razorpay_payment_id
                },
                { new: true } // Return the updated document
            );

            // Send confirmation email
            if (booking) {
                await emailService.sendBookingConfirmation(booking);
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
});

module.exports = router; 