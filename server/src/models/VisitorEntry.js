const mongoose = require('mongoose');

const visitorEntrySchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    ticketNumber: {
        type: String,
        required: true
    },
    visitorName: {
        type: String,
        required: true
    },
    entryTime: {
        type: Date,
        default: Date.now
    },
    exitTime: {
        type: Date,
        default: null
    },
    isExited: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('VisitorEntry', visitorEntrySchema); 