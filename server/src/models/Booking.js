const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // User Information
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    governmentId: {
        type: String,
        required: true
    },
    // Booking Information
    ticketType: {
        type: String,
        required: true,
        enum: ['Individual Entry', 'Entry + Meal Package', 'Family Pack', 'Group Package']
    },
    visitDate: {
        type: Date,
        required: true
    },
    numberOfVisitors: {
        type: Number,
        required: true,
        min: 1
    },
    ticketPrice: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    taxes: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    promoCode: {
        type: String,
        default: null
    },
    discount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    ticketNumber: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate ticket number before saving
bookingSchema.pre('save', async function (next) {
    if (!this.ticketNumber) {
        const date = new Date();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.ticketNumber = `TKT-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema); 