/**
 * This script redistributes unassigned revenue to the proper ticket types
 * It examines bookings and forces each stats record to match booking data
 */

const mongoose = require('mongoose');
const Stats = require('../models/Stats');
const Booking = require('../models/Booking');

// Map booking ticket types to stats ticket types
const TICKET_TYPE_MAP = {
    'Individual Entry': 'individual',
    'Entry + Meal Package': 'meal',
    'Family Pack': 'family',
    'Group Package': 'group'
};

async function redistributeTicketRevenue() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/smart_amusement_park', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Get all bookings with completed payment status
        const allBookings = await Booking.find({ paymentStatus: 'completed' });
        console.log(`Found ${allBookings.length} completed bookings to process`);

        // Group bookings by date and ticket type
        const bookingsByDate = {};

        for (const booking of allBookings) {
            const visitDate = new Date(booking.visitDate);
            visitDate.setHours(0, 0, 0, 0);
            const dateString = visitDate.toISOString().split('T')[0];

            if (!bookingsByDate[dateString]) {
                bookingsByDate[dateString] = {
                    date: visitDate,
                    totalRevenue: 0,
                    totalVisitors: 0,
                    totalTickets: 0,
                    types: {
                        individual: { count: 0, revenue: 0 },
                        meal: { count: 0, revenue: 0 },
                        family: { count: 0, revenue: 0 },
                        group: { count: 0, revenue: 0 }
                    }
                };
            }

            // Map the ticket type
            const ticketTypeKey = TICKET_TYPE_MAP[booking.ticketType];
            if (ticketTypeKey) {
                bookingsByDate[dateString].types[ticketTypeKey].count += 1;
                bookingsByDate[dateString].types[ticketTypeKey].revenue += booking.totalAmount;
            } else {
                console.warn(`Unknown ticket type: ${booking.ticketType} for booking ${booking._id}`);
            }

            // Update totals
            bookingsByDate[dateString].totalRevenue += booking.totalAmount;
            bookingsByDate[dateString].totalVisitors += booking.numberOfVisitors;
            bookingsByDate[dateString].totalTickets += 1;
        }

        console.log(`Processed bookings for ${Object.keys(bookingsByDate).length} unique dates`);

        // Update stats records with the booking data
        for (const dateString in bookingsByDate) {
            const bookingData = bookingsByDate[dateString];

            // Find or create stats for this date
            let stats = await Stats.findOne({ date: bookingData.date });
            if (!stats) {
                console.log(`Creating new stats record for ${dateString}`);
                stats = new Stats({ date: bookingData.date });
            }

            // Update the stats with booking data
            stats.revenue = bookingData.totalRevenue;
            stats.visitorCount = bookingData.totalVisitors;
            stats.ticketsSold = bookingData.totalTickets;

            // Set ticket types based on actual bookings
            stats.ticketTypes = bookingData.types;

            // Save the updated stats
            await stats.save();
            console.log(`Updated stats for ${dateString}`);
        }

        console.log('Revenue redistribution completed successfully');
    } catch (error) {
        console.error('Error redistributing revenue:', error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the redistribution
redistributeTicketRevenue().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
}); 