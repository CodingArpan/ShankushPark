/**
 * This script fixes the ticket distribution in Stats collection
 * It should be run once to correct the data after fixing the updateForBooking method
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

async function fixTicketDistribution() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/smart_amusement_park', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Get all stats records
        const allStats = await Stats.find({});
        console.log(`Found ${allStats.length} stats records to process`);

        for (const stats of allStats) {
            const statsDate = new Date(stats.date);
            statsDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(statsDate);
            nextDay.setDate(nextDay.getDate() + 1);

            // Reset ticket type counts and revenue
            stats.ticketTypes = {
                individual: { count: 0, revenue: 0 },
                meal: { count: 0, revenue: 0 },
                family: { count: 0, revenue: 0 },
                group: { count: 0, revenue: 0 }
            };

            // Find all completed bookings for this day
            const bookings = await Booking.find({
                visitDate: {
                    $gte: statsDate,
                    $lt: nextDay
                },
                paymentStatus: 'completed'
            });

            console.log(`Processing ${bookings.length} bookings for ${statsDate.toISOString().split('T')[0]}`);

            let totalVisitors = 0;
            let totalTickets = 0;
            let totalRevenue = 0;

            // Process each booking
            for (const booking of bookings) {
                // Map booking ticket type to stats ticket type
                const ticketTypeKey = TICKET_TYPE_MAP[booking.ticketType];

                if (ticketTypeKey && stats.ticketTypes[ticketTypeKey]) {
                    // Update ticket type stats
                    stats.ticketTypes[ticketTypeKey].count += 1;
                    stats.ticketTypes[ticketTypeKey].revenue += booking.totalAmount;
                } else {
                    console.warn(`Unknown ticket type: ${booking.ticketType} for booking ${booking._id}`);

                    // Try fallback
                    const fallbackKey = booking.ticketType.toLowerCase().replace(/\s+/g, '').replace(/\+/g, '');
                    if (stats.ticketTypes[fallbackKey]) {
                        stats.ticketTypes[fallbackKey].count += 1;
                        stats.ticketTypes[fallbackKey].revenue += booking.totalAmount;
                    }
                }

                // Update totals
                totalVisitors += booking.numberOfVisitors;
                totalTickets += 1;
                totalRevenue += booking.totalAmount;
            }

            // If we have bookings, update the stats totals
            if (bookings.length > 0) {
                stats.visitorCount = totalVisitors;
                stats.ticketsSold = totalTickets;
                stats.revenue = totalRevenue;

                // Save updated stats
                await stats.save();
                console.log(`Updated stats for ${statsDate.toISOString().split('T')[0]}`);
            } else {
                console.log(`No bookings found for ${statsDate.toISOString().split('T')[0]}, skipping update`);
            }
        }

        console.log('Ticket distribution fix completed successfully');
    } catch (error) {
        console.error('Error fixing ticket distribution:', error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the fix
fixTicketDistribution().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
}); 