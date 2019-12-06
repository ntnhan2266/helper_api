const cron = require("node-cron");
const Booking = require("../models/booking");
const Constant = require('../utils/constants');

// Run at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({startDate: {$lt: now}});
    for (let booking of expiredBookings) {
        booking.status = Constant.BOOKING_STATUS.CANCELLED;
        booking.save();
    }
  } catch (e) {
    console.log(e);
  }
});
