const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'trashquery@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'wtaa xzmb iyjb iloy'
    },
    tls: {
        rejectUnauthorized: false    // optional: bypass self-signed certs
    },
    connectionTimeout: 10000,
    debug: true, // Enable debugging
    logger: true // Enable logging       // optional: increase timeout (10s)
});

const sendBookingConfirmation = async (booking) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: booking.email,
        subject: 'Your Amusement Park Booking Confirmation',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0066CC;">Booking Confirmation</h2>
                <p>Dear ${booking.name},</p>
                <p>Thank you for booking with us! Your booking has been confirmed.</p>
                
                <h3 style="color: #0066CC; margin-top: 20px;">Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Ticket Number</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${booking.ticketNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Ticket Type</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${booking.ticketType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Visit Date</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(booking.visitDate).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Number of Visitors</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${booking.numberOfVisitors}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Total Amount</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">₹${booking.totalAmount}</td>
                    </tr>
                </table>

                <h3 style="color: #0066CC; margin-top: 20px;">Important Information</h3>
                <ul style="margin-top: 10px;">
                    <li>Please carry a valid government ID for verification at the entrance</li>
                    <li>Please arrive at least 30 minutes before your scheduled time</li>
                    <li>Present this email or your ticket number at the entrance</li>
                </ul>

                <p style="margin-top: 20px;">If you have any questions, please contact our support team at support@amusementpark.com</p>
                
                <p style="margin-top: 20px;">Best regards,<br>Amusement Park Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendBookingConfirmation
}; 