# Smart Amusement Park System

A complete amusement park booking system with integrated payment processing using Razorpay.

## Features

- User-friendly landing page with information about park attractions
- Ticket booking system with multiple package options
- User information collection (name, email, mobile number, government ID)
- Secure payment processing via Razorpay
- Email confirmation with ticket details
- Responsive design for all devices

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Razorpay account for payment processing

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/amusement-park
   JWT_SECRET=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_specific_password
   ```

   Note: For Gmail, you'll need to use an app-specific password if you have 2FA enabled.

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. The frontend is built using HTML, CSS, and JavaScript
2. Open the `index.html` file in your browser or serve it using a local server

## Payment Integration

The payment integration uses Razorpay's JavaScript SDK to process payments. The flow is as follows:

1. User selects ticket type and fills personal information
2. On form submission, a booking is created in the database with a 'pending' payment status
3. A Razorpay order is created with the booking details
4. The Razorpay payment modal opens for the user to enter payment details
5. After successful payment, the server verifies the payment signature
6. The booking status is updated and a confirmation email is sent
7. User is redirected to a success page with booking details

## API Endpoints

### Booking API

- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID

### Payment API

- `POST /api/payments/create-order` - Create a Razorpay order
- `POST /api/payments/verify-payment` - Verify payment after completion

## Security Considerations

- User personal information is stored securely in the database
- Payment processing uses Razorpay's secure checkout system
- Server-side verification of payment signature before confirming bookings
- Environment variables for sensitive information

## Customization

You can customize various aspects of the application:

- Ticket prices and packages in the index.html file
- Email templates in emailService.js
- UI styling through the Tailwind CSS classes in index.html

## Troubleshooting

- If payments aren't working, check your Razorpay API keys
- For email issues, ensure your EMAIL_USER and EMAIL_PASSWORD are correctly set
- MongoDB connection issues can be resolved by checking your connection string

## License

This project is licensed under the MIT License. 