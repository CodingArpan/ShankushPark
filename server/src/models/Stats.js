const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    visitorCount: {
        type: Number,
        default: 0
    },
    ticketsSold: {
        type: Number,
        default: 0
    },
    revenue: {
        type: Number,
        default: 0
    },
    ticketTypes: {
        individual: {
            count: { type: Number, default: 0 },
            revenue: { type: Number, default: 0 }
        },
        meal: {
            count: { type: Number, default: 0 },
            revenue: { type: Number, default: 0 }
        },
        family: {
            count: { type: Number, default: 0 },
            revenue: { type: Number, default: 0 }
        },
        group: {
            count: { type: Number, default: 0 },
            revenue: { type: Number, default: 0 }
        }
    }
});

// Static method to update stats when a booking is made
statsSchema.statics.updateForBooking = async function (booking) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's stats or create if not exists
    let stats = await this.findOne({ date: today });

    if (!stats) {
        stats = new this({ date: today });
    }

    // Update ticket count and revenue
    stats.ticketsSold += 1;
    stats.visitorCount += booking.numberOfVisitors;
    stats.revenue += booking.totalAmount;

    // Update ticket type stats
    const ticketTypeKey = booking.ticketType.toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
    if (stats.ticketTypes[ticketTypeKey]) {
        stats.ticketTypes[ticketTypeKey].count += 1;
        stats.ticketTypes[ticketTypeKey].revenue += booking.totalAmount;
    }

    return stats.save();
};

module.exports = mongoose.model('Stats', statsSchema); 