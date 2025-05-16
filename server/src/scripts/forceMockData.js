/**
 * This script directly adds mock ticket distribution data to Stats collection
 */

const mongoose = require('mongoose');
const Stats = require('../models/Stats');

async function addMockDistribution() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/smart_amusement_park', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Get today's date and set to start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find or create stats for today
        let stats = await Stats.findOne({ date: today });
        if (!stats) {
            stats = new Stats({ date: today });
        }

        // Get the total revenue from existing stats
        const totalRevenue = stats.revenue || 10107;

        // Set up ticket distribution
        stats.revenue = totalRevenue;
        stats.visitorCount = 45;
        stats.ticketsSold = 11;

        // Distribute revenue and counts across the 4 ticket types
        stats.ticketTypes = {
            individual: {
                count: 5,
                revenue: Math.round(totalRevenue * 0.3) // 30% of revenue
            },
            meal: {
                count: 3,
                revenue: Math.round(totalRevenue * 0.25) // 25% of revenue
            },
            family: {
                count: 2,
                revenue: Math.round(totalRevenue * 0.25) // 25% of revenue
            },
            group: {
                count: 1,
                revenue: Math.round(totalRevenue * 0.2) // 20% of revenue
            }
        };

        // Save the updated stats
        await stats.save();
        console.log(`Updated stats for ${today.toISOString().split('T')[0]}`);
        console.log('Distribution:', stats.ticketTypes);

        // Check all stats for current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthStats = await Stats.find({
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        console.log(`Found ${monthStats.length} stats records for current month`);

        // Update all stats for the current month with distributed data
        for (const stat of monthStats) {
            if (stat.date.toISOString() !== today.toISOString()) {
                const statRevenue = stat.revenue || 0;
                if (statRevenue > 0) {
                    // Distribute revenue across ticket types
                    stat.ticketTypes = {
                        individual: {
                            count: Math.round(stat.ticketsSold * 0.45) || 1,
                            revenue: Math.round(statRevenue * 0.3)
                        },
                        meal: {
                            count: Math.round(stat.ticketsSold * 0.27) || 1,
                            revenue: Math.round(statRevenue * 0.25)
                        },
                        family: {
                            count: Math.round(stat.ticketsSold * 0.18) || 1,
                            revenue: Math.round(statRevenue * 0.25)
                        },
                        group: {
                            count: Math.round(stat.ticketsSold * 0.1) || 1,
                            revenue: Math.round(statRevenue * 0.2)
                        }
                    };
                    await stat.save();
                    console.log(`Updated distribution for ${stat.date.toISOString().split('T')[0]}`);
                }
            }
        }

        console.log('Mock distribution added successfully');
    } catch (error) {
        console.error('Error adding mock distribution:', error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the function
addMockDistribution().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
}); 