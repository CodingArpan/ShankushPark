const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');
const VisitorEntry = require('../models/VisitorEntry');
const Booking = require('../models/Booking');

// Get daily stats
router.get('/daily', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let start, end;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);

            // Validate dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date parameters'
                });
            }

            end.setHours(23, 59, 59, 999);
        } else {
            // Default to last 7 days
            end = new Date();
            start = new Date();
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
        }

        const stats = await Stats.find({
            date: {
                $gte: start,
                $lte: end
            }
        }).sort({ date: 1 });

        res.status(200).json({
            success: true,
            data: stats || []
        });
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily stats',
            error: error.message
        });
    }
});

// Get weekly stats aggregated
router.get('/weekly', async (req, res) => {
    try {
        const { year } = req.query;
        const selectedYear = year || new Date().getFullYear();

        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

        const weeklyStats = await Stats.aggregate([
            {
                $match: {
                    date: {
                        $gte: startOfYear,
                        $lte: endOfYear
                    }
                }
            },
            {
                $addFields: {
                    week: { $week: "$date" }
                }
            },
            {
                $group: {
                    _id: "$week",
                    visitorCount: { $sum: "$visitorCount" },
                    ticketsSold: { $sum: "$ticketsSold" },
                    revenue: { $sum: "$revenue" },
                    startDate: { $min: "$date" }
                }
            },
            {
                $sort: { "_id": 1 }
            },
            {
                $project: {
                    week: "$_id",
                    visitorCount: 1,
                    ticketsSold: 1,
                    revenue: 1,
                    startDate: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: weeklyStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly stats',
            error: error.message
        });
    }
});

// Get monthly stats aggregated
router.get('/monthly', async (req, res) => {
    try {
        const { year } = req.query;
        const selectedYear = year ? parseInt(year, 10) : new Date().getFullYear();

        // Validate year
        if (isNaN(selectedYear) || selectedYear < 2000 || selectedYear > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid year parameter'
            });
        }

        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

        const monthlyStats = await Stats.aggregate([
            {
                $match: {
                    date: {
                        $gte: startOfYear,
                        $lte: endOfYear
                    }
                }
            },
            {
                $addFields: {
                    month: { $month: "$date" }
                }
            },
            {
                $group: {
                    _id: "$month",
                    visitorCount: { $sum: "$visitorCount" },
                    ticketsSold: { $sum: "$ticketsSold" },
                    revenue: { $sum: "$revenue" },
                    individual: { $sum: "$ticketTypes.individual.revenue" },
                    meal: { $sum: "$ticketTypes.meal.revenue" },
                    family: { $sum: "$ticketTypes.family.revenue" },
                    group: { $sum: "$ticketTypes.group.revenue" }
                }
            },
            {
                $sort: { "_id": 1 }
            },
            {
                $project: {
                    month: "$_id",
                    visitorCount: 1,
                    ticketsSold: 1,
                    revenue: 1,
                    individual: 1,
                    meal: 1,
                    family: 1,
                    group: 1,
                    _id: 0
                }
            }
        ]);

        // Map month numbers to names
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const mappedStats = monthlyStats.map(stat => ({
            ...stat,
            monthName: monthNames[stat.month - 1]
        }));

        res.status(200).json({
            success: true,
            data: mappedStats
        });
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly stats',
            error: error.message
        });
    }
});

// Get ticket type distribution
router.get('/ticket-types', async (req, res) => {
    // try {
    //     const { startDate, endDate } = req.query;
    //     let start, end;

    //     if (startDate && endDate) {
    //         start = new Date(startDate);
    //         end = new Date(endDate);

    //         // Validate dates
    //         if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'Invalid date parameters'
    //             });
    //         }

    //         end.setHours(23, 59, 59, 999);
    //     } else {
    //         // Default to current month
    //         const today = new Date();
    //         start = new Date(today.getFullYear(), today.getMonth(), 1);
    //         end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    //     }

    //     // Get booking data for this date range to ensure proper distribution
    //     const bookings = await Booking.find({
    //         visitDate: {
    //             $gte: start,
    //             $lte: end
    //         },
    //         paymentStatus: 'completed'
    //     });

    //     // Calculate ticket distribution from bookings
    //     const bookingDistribution = {
    //         individual: { count: 0, revenue: 0 },
    //         meal: { count: 0, revenue: 0 },
    //         family: { count: 0, revenue: 0 },
    //         group: { count: 0, revenue: 0 }
    //     };

    //     let totalBookingRevenue = 0;

    //     // Map from ticket type names to distribution keys
    //     const ticketTypeMap = {
    //         'Individual Entry': 'individual',
    //         'Entry + Meal Package': 'meal',
    //         'Family Pack': 'family',
    //         'Group Package': 'group'
    //     };

    //     // Process each booking to get accurate distribution
    //     for (const booking of bookings) {
    //         const key = ticketTypeMap[booking.ticketType];
    //         if (key && bookingDistribution[key]) {
    //             bookingDistribution[key].count += 1;
    //             bookingDistribution[key].revenue += booking.totalAmount;
    //             totalBookingRevenue += booking.totalAmount;
    //         }
    //     }

    //     // Get stats data to get total revenue (in case there are discrepancies)
    //     const stats = await Stats.aggregate([
    //         {
    //             $match: {
    //                 date: {
    //                     $gte: start,
    //                     $lte: end
    //                 }
    //             }
    //         },
    //         {
    //             $group: {
    //                 _id: null,
    //                 individual: { $sum: "$ticketTypes.individual.count" },
    //                 meal: { $sum: "$ticketTypes.meal.count" },
    //                 family: { $sum: "$ticketTypes.family.count" },
    //                 group: { $sum: "$ticketTypes.group.count" },
    //                 totalRevenue: { $sum: "$revenue" },
    //                 individualRevenue: { $sum: "$ticketTypes.individual.revenue" },
    //                 mealRevenue: { $sum: "$ticketTypes.meal.revenue" },
    //                 familyRevenue: { $sum: "$ticketTypes.family.revenue" },
    //                 groupRevenue: { $sum: "$ticketTypes.group.revenue" }
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0,
    //                 ticketCounts: {
    //                     individual: "$individual",
    //                     meal: "$meal",
    //                     family: "$family",
    //                     group: "$group"
    //                 },
    //                 totalRevenue: 1,
    //                 revenueDistribution: {
    //                     individual: "$individualRevenue",
    //                     meal: "$mealRevenue",
    //                     family: "$familyRevenue",
    //                     group: "$groupRevenue"
    //                 }
    //             }
    //         }
    //     ]);

    //     // FORCE REVENUE DISTRIBUTION - HACK FOR DEMO
    //     // This ensures we always have all 4 ticket types with revenue
    //     const responseData = {
    //         ticketCounts: {
    //             individual: 5,
    //             meal: 3,
    //             family: 2,
    //             group: 1
    //         },
    //         totalRevenue: stats.length > 0 ? stats[0].totalRevenue : 10107,
    //         revenueDistribution: {
    //             individual: 0,
    //             meal: 0,
    //             family: 0,
    //             group: 0
    //         }
    //     };

    //     // Distribute total revenue evenly
    //     responseData.revenueDistribution.individual = Math.round(responseData.totalRevenue * 0.3); // 30%
    //     responseData.revenueDistribution.meal = Math.round(responseData.totalRevenue * 0.25); // 25%
    //     responseData.revenueDistribution.family = Math.round(responseData.totalRevenue * 0.25); // 25%
    //     responseData.revenueDistribution.group = Math.round(responseData.totalRevenue * 0.2); // 20%

    //     res.status(200).json({
    //         success: true,
    //         data: responseData
    //     });
    // } catch (error) {
    //     console.error('Error fetching ticket type distribution:', error);
    //     res.status(500).json({
    //         success: false,
    //         message: 'Error fetching ticket type distribution',
    //         error: error.message
    //     });
    // }

    try {
        const { startDate, endDate } = req.query;
        let start, end;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);

            // Validate dates
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date parameters'
                });
            }

            end.setHours(23, 59, 59, 999);
        } else {
            // Default to current month
            const today = new Date();
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // Get booking data for this date range to ensure proper distribution
        const bookings = await Booking.find({
            visitDate: {
                $gte: start,
                $lte: end
            },
            paymentStatus: 'completed'
        });

        // Calculate ticket distribution from actual bookings
        const bookingDistribution = {
            individual: { count: 0, revenue: 0 },
            meal: { count: 0, revenue: 0 },
            family: { count: 0, revenue: 0 },
            group: { count: 0, revenue: 0 }
        };

        let totalBookingRevenue = 0;

        // Map from ticket type names to distribution keys
        const ticketTypeMap = {
            'Individual Entry': 'individual',
            'Entry + Meal Package': 'meal',
            'Family Pack': 'family',
            'Group Package': 'group'
        };

        // Process each booking to get accurate distribution
        for (const booking of bookings) {
            const key = ticketTypeMap[booking.ticketType];
            if (key && bookingDistribution[key]) {
                bookingDistribution[key].count += 1;
                bookingDistribution[key].revenue += booking.totalAmount;
                totalBookingRevenue += booking.totalAmount;
            }
        }

        // Get stats data as a backup for any missing data
        const stats = await Stats.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    individual: { $sum: "$ticketTypes.individual.count" },
                    meal: { $sum: "$ticketTypes.meal.count" },
                    family: { $sum: "$ticketTypes.family.count" },
                    group: { $sum: "$ticketTypes.group.count" },
                    totalRevenue: { $sum: "$revenue" },
                    individualRevenue: { $sum: "$ticketTypes.individual.revenue" },
                    mealRevenue: { $sum: "$ticketTypes.meal.revenue" },
                    familyRevenue: { $sum: "$ticketTypes.family.revenue" },
                    groupRevenue: { $sum: "$ticketTypes.group.revenue" }
                }
            },
            {
                $project: {
                    _id: 0,
                    ticketCounts: {
                        individual: "$individual",
                        meal: "$meal",
                        family: "$family",
                        group: "$group"
                    },
                    totalRevenue: 1,
                    revenueDistribution: {
                        individual: "$individualRevenue",
                        meal: "$mealRevenue",
                        family: "$familyRevenue",
                        group: "$groupRevenue"
                    }
                }
            }
        ]);

        // Create response using actual booking data
        const responseData = {
            ticketCounts: {
                individual: bookingDistribution.individual.count,
                meal: bookingDistribution.meal.count,
                family: bookingDistribution.family.count,
                group: bookingDistribution.group.count
            },
            totalRevenue: totalBookingRevenue,
            revenueDistribution: {
                individual: bookingDistribution.individual.revenue,
                meal: bookingDistribution.meal.revenue,
                family: bookingDistribution.family.revenue,
                group: bookingDistribution.group.revenue
            }
        };

        // If we have Stats data, use it to supplement missing information
        if (stats.length > 0) {
            // If we have no bookings data, use stats data instead
            if (totalBookingRevenue === 0) {
                responseData.totalRevenue = stats[0].totalRevenue || 0;

                // Use stats distribution if available
                if (stats[0].revenueDistribution) {
                    responseData.revenueDistribution = stats[0].revenueDistribution;
                }

                // Use stats ticket counts if available
                if (stats[0].ticketCounts) {
                    responseData.ticketCounts = stats[0].ticketCounts;
                }
            }
        }

        res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error fetching ticket type distribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket type distribution',
            error: error.message
        });
    }
});

// Get today's summary
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's stats
        let todayStats = await Stats.findOne({ date: today });

        // If no stats exist for today, create a default object
        if (!todayStats) {
            todayStats = new Stats({
                date: today,
                visitorCount: 0,
                ticketsSold: 0,
                revenue: 0,
                ticketTypes: {
                    individual: { count: 0, revenue: 0 },
                    meal: { count: 0, revenue: 0 },
                    family: { count: 0, revenue: 0 },
                    group: { count: 0, revenue: 0 }
                }
            });

            try {
                await todayStats.save();
                console.log('Created new stats record for today');
            } catch (saveError) {
                console.error('Failed to create stats for today:', saveError);
                // Continue with default values even if save fails
            }
        }

        // Get current visitors in the park
        const currentVisitors = await VisitorEntry.countDocuments({
            entryTime: { $gte: today, $lt: tomorrow },
            isExited: false
        });

        // Get expected visitors for today
        const expectedVisitors = await Booking.aggregate([
            {
                $match: {
                    visitDate: { $gte: today, $lt: tomorrow },
                    paymentStatus: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpected: { $sum: "$numberOfVisitors" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                date: today,
                currentVisitorsInPark: currentVisitors || 0,
                expectedVisitors: expectedVisitors.length > 0 ? expectedVisitors[0].totalExpected : 0,
                ticketsSold: todayStats.ticketsSold || 0,
                revenue: todayStats.revenue || 0,
                visitorCount: todayStats.visitorCount || 0
            }
        });
    } catch (error) {
        console.error('Error fetching today\'s summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s summary',
            error: error.message
        });
    }
});

module.exports = router; 