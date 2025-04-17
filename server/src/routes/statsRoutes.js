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
            data: stats
        });
    } catch (error) {
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
        const selectedYear = year || new Date().getFullYear();

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
        res.status(500).json({
            success: false,
            message: 'Error fetching monthly stats',
            error: error.message
        });
    }
});

// Get ticket type distribution
router.get('/ticket-types', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let start, end;

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        } else {
            // Default to current month
            const today = new Date();
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        }

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

        res.status(200).json({
            success: true,
            data: stats[0] || {
                ticketCounts: { individual: 0, meal: 0, family: 0, group: 0 },
                totalRevenue: 0,
                revenueDistribution: { individual: 0, meal: 0, family: 0, group: 0 }
            }
        });
    } catch (error) {
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
        const todayStats = await Stats.findOne({ date: today });

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
                currentVisitorsInPark: currentVisitors,
                expectedVisitors: expectedVisitors.length > 0 ? expectedVisitors[0].totalExpected : 0,
                ticketsSold: todayStats ? todayStats.ticketsSold : 0,
                revenue: todayStats ? todayStats.revenue : 0,
                visitorCount: todayStats ? todayStats.visitorCount : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s summary',
            error: error.message
        });
    }
});

module.exports = router; 